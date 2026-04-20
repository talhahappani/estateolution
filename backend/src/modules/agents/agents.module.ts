import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from './schemas/agent.schema';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import {
  Transaction,
  TransactionSchema,
} from '../transactions/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: AgentSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [AgentsController],
  providers: [AgentsService],
  exports: [MongooseModule],
})
export class AgentsModule {}
