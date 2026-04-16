import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from './schemas/agent.schema';

@Module({
  imports: [
    // Register the Agent schema with Mongoose
    MongooseModule.forFeature([{ name: Agent.name, schema: AgentSchema }]),
  ],
  controllers: [],
  providers: [],
  exports: [MongooseModule],
})
export class AgentsModule {}
