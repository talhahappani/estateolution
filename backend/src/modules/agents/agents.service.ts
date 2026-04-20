import {
  ConflictException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent } from './schemas/agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';
import { Transaction } from '../transactions/schemas/transaction.schema';
import { TransactionStatus } from '../../common/enums/transaction-status.enum';

@Injectable()
export class AgentsService {
  constructor(
    @InjectModel(Agent.name) private agentModel: Model<Agent>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    try {
      const newAgent = new this.agentModel(createAgentDto);
      return await newAgent.save();
    } catch (error: unknown) {
      // Handle MongoDB duplicate key error for unique email
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('An agent with this email already exists.');
      }
      throw error;
    }
  }

  async findAll(): Promise<Agent[]> {
    return this.agentModel.find({ isActive: true }).exec();
  }

  async delete(id: string): Promise<void> {
    // 1. Check for active transactions tied to this agent
    const activeTransaction = await this.transactionModel.findOne({
      $or: [{ listingAgentId: id }, { sellingAgentId: id }],
      status: {
        $nin: [TransactionStatus.COMPLETED, TransactionStatus.CANCELLED],
      },
    });

    if (activeTransaction) {
      throw new BadRequestException(
        'Cannot delete agent: They are assigned to an active transaction. Please complete or cancel the transaction first.',
      );
    }

    // 2. Proceed with Soft Delete
    await this.agentModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }
}
