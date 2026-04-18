import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus } from '../../common/enums/transaction-status.enum';
import { CommissionsService } from '../commissions/commissions.service';

@Injectable()
export class TransactionsService {
  // STRICT LINEAR TRANSITION RULES
  private readonly validTransitions = {
    [TransactionStatus.AGREEMENT]: [TransactionStatus.EARNEST_MONEY],
    [TransactionStatus.EARNEST_MONEY]: [TransactionStatus.TITLE_DEED],
    [TransactionStatus.TITLE_DEED]: [TransactionStatus.COMPLETED],
  };

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private commissionsService: CommissionsService,
  ) {}

  async create(createDto: CreateTransactionDto): Promise<Transaction> {
    const newTransaction = new this.transactionModel({
      ...createDto,
      status: TransactionStatus.AGREEMENT,
      stageHistory: [
        {
          stage: TransactionStatus.AGREEMENT,
          enteredAt: new Date(),
        },
      ],
    });

    return newTransaction.save();
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionModel
      .find()
      .populate('listingAgentId sellingAgentId')
      .exec();
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel
      .findById(id)
      .populate('listingAgentId sellingAgentId')
      .exec();

    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  async updateStage(
    id: string,
    newStage: TransactionStatus,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);

    // Guard: Cannot transition a cancelled transaction
    if (transaction.status === TransactionStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot change stage of a cancelled transaction.',
      );
    }

    // Guard: Cannot transition a completed transaction
    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Transaction is already completed.');
    }

    // Guard: Check State Machine Rules
    const allowedNextStages =
      this.validTransitions[transaction.status as TransactionStatus];
    if (!allowedNextStages || !allowedNextStages.includes(newStage)) {
      throw new BadRequestException(
        `Invalid transition. Cannot move from '${transaction.status}' to '${newStage}'.`,
      );
    }

    // If moving to COMPLETED, calculate and embed the financial breakdown
    if (newStage === TransactionStatus.COMPLETED) {
      const breakdown = this.commissionsService.calculateCommission(
        transaction.totalServiceFee,
        transaction.listingAgentId._id as Types.ObjectId, // Asserting type since it might be populated
        transaction.sellingAgentId._id as Types.ObjectId,
      );
      transaction.financialBreakdown = breakdown;
    }

    // Update status and push to history
    transaction.status = newStage;
    transaction.stageHistory.push({
      stage: newStage,
      enteredAt: new Date(),
    });

    return transaction.save();
  }

  async cancelTransaction(id: string, reason: string): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (
      transaction.status === TransactionStatus.COMPLETED ||
      transaction.status === TransactionStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot cancel a completed or already cancelled transaction.',
      );
    }

    transaction.status = TransactionStatus.CANCELLED;
    transaction.cancellationReason = reason;
    transaction.cancelledAt = new Date();

    transaction.stageHistory.push({
      stage: TransactionStatus.CANCELLED,
      enteredAt: new Date(),
    });

    return transaction.save();
  }

  async getStats() {
    const totalTransactions = await this.transactionModel.countDocuments();

    const completedTransactions = await this.transactionModel.countDocuments({
      status: TransactionStatus.COMPLETED,
    });

    const cancelledTransactions = await this.transactionModel.countDocuments({
      status: TransactionStatus.CANCELLED,
    });

    // Use MongoDB Aggregation to sum up all agency earnings from completed transactions
    const earningsAggregation = await this.transactionModel.aggregate([
      { $match: { status: TransactionStatus.COMPLETED } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$financialBreakdown.agencyEarning' },
        },
      },
    ]);

    const totalAgencyEarnings =
      earningsAggregation.length > 0 ? earningsAggregation[0].totalEarnings : 0;

    return {
      totalTransactions,
      completedTransactions,
      cancelledTransactions,
      totalAgencyEarnings,
    };
  }
}
