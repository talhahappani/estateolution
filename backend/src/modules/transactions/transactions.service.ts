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
  private readonly validTransitions: Partial<
    Record<TransactionStatus, TransactionStatus[]>
  > = {
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

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const data = await this.transactionModel
      .find()
      .populate('listingAgentId sellingAgentId')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.transactionModel.countDocuments();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
    if (
      (transaction.status as TransactionStatus) === TransactionStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot change stage of a cancelled transaction.',
      );
    }

    // Guard: Cannot transition a completed transaction
    if (
      (transaction.status as TransactionStatus) === TransactionStatus.COMPLETED
    ) {
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
      const listingId = (transaction.listingAgentId as { _id: Types.ObjectId })
        ._id;
      const sellingId = (transaction.sellingAgentId as { _id: Types.ObjectId })
        ._id;

      const breakdown = this.commissionsService.calculateCommission(
        transaction.totalServiceFee,
        listingId,
        sellingId,
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
      (transaction.status as TransactionStatus) ===
        TransactionStatus.COMPLETED ||
      (transaction.status as TransactionStatus) === TransactionStatus.CANCELLED
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

    const totalAgencyEarnings: number =
      earningsAggregation.length > 0
        ? (earningsAggregation[0] as { totalEarnings: number }).totalEarnings
        : 0;

    return {
      totalTransactions,
      completedTransactions,
      cancelledTransactions,
      totalAgencyEarnings,
    };
  }

  // Get Agent Performance using MongoDB Aggregation
  async getAgentPerformance() {
    return this.transactionModel.aggregate([
      { $match: { status: TransactionStatus.COMPLETED } },

      { $unwind: '$financialBreakdown.agents' },

      {
        $group: {
          _id: '$financialBreakdown.agents.agentId',
          totalEarnings: { $sum: '$financialBreakdown.agents.earning' },
          completedDeals: { $sum: 1 },
        },
      },

      {
        $lookup: {
          from: 'agents',
          localField: '_id',
          foreignField: '_id',
          as: 'agentInfo',
        },
      },

      { $unwind: '$agentInfo' },

      {
        $project: {
          _id: 0,
          agentId: '$_id',
          agentName: {
            $concat: ['$agentInfo.firstName', ' ', '$agentInfo.lastName'],
          },
          totalEarnings: 1,
          completedDeals: 1,
        },
      },

      { $sort: { totalEarnings: -1 } },
    ]);
  }
}
