import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent } from './schemas/agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class AgentsService {
  constructor(@InjectModel(Agent.name) private agentModel: Model<Agent>) {}

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    try {
      const newAgent = new this.agentModel(createAgentDto);
      return await newAgent.save();
    } catch (error) {
      // Handle MongoDB duplicate key error for unique email
      if (error.code === 11000) {
        throw new ConflictException('An agent with this email already exists.');
      }
      throw error;
    }
  }

  async findAll(): Promise<Agent[]> {
    return this.agentModel.find().exec();
  }
}
