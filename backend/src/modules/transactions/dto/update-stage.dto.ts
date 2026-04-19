import { IsEnum } from 'class-validator';
import { TransactionStatus } from '../../../common/enums/transaction-status.enum';

export class UpdateStageDto {
  @IsEnum(TransactionStatus)
  newStage!: TransactionStatus;
}
