import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TransactionStatus } from '../../../common/enums/transaction-status.enum';
import { TransactionType } from '../../../common/enums/transaction-type.enum';

// Sub-schema: For tracking stage history
@Schema({ _id: false })
export class StageHistory {
  @Prop({ type: String, enum: TransactionStatus, required: true })
  stage!: string;

  @Prop({ default: Date.now })
  enteredAt!: Date;
}

// Sub-schema: Agent earnings inside financial breakdown
@Schema({ _id: false })
export class AgentEarning {
  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  agentId!: Types.ObjectId;

  @Prop({ required: true, enum: ['listing', 'selling', 'both'] })
  role!: string;

  @Prop({ required: true })
  earning!: number;
}

// Sub-schema: Financial Breakdown (Embedded Document)
@Schema({ _id: false })
export class FinancialBreakdown {
  @Prop({ required: true })
  agencyEarning!: number;

  @Prop({ type: [AgentEarning], required: true })
  agents!: AgentEarning[];
}

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true })
  propertyTitle!: string;

  @Prop({ type: String, enum: TransactionType, required: true })
  transactionType!: string;

  @Prop({ required: true, min: 0 })
  totalServiceFee!: number;

  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  listingAgentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Agent', required: true })
  sellingAgentId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: TransactionStatus,
    default: TransactionStatus.AGREEMENT,
  })
  status!: string;

  @Prop({ type: [StageHistory], default: [] })
  stageHistory!: StageHistory[];

  @Prop({ type: String, default: null })
  cancellationReason!: string;

  @Prop({ type: Date, default: null })
  cancelledAt!: Date;

  @Prop({ type: FinancialBreakdown, default: null })
  financialBreakdown!: FinancialBreakdown;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
