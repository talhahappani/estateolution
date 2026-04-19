import { IsEnum, IsMongoId, IsNumber, IsString, Min } from 'class-validator';
import { TransactionType } from '../../../common/enums/transaction-type.enum';

export class CreateTransactionDto {
  @IsString()
  propertyTitle!: string;

  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @IsNumber()
  @Min(0)
  totalServiceFee!: number;

  @IsMongoId()
  listingAgentId!: string;

  @IsMongoId()
  sellingAgentId!: string;
}
