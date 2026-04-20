import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Agent extends Document {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);

// Emails must be unique ONLY among active agents.
// If an agent is soft-deleted (isActive: false), their original email is kept intact,
// and a new agent can register with the same email without throwing a MongoDB duplicate error.
AgentSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);
