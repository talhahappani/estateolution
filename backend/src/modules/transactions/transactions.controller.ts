import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createDto: CreateTransactionDto) {
    return this.transactionsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Patch(':id/stage')
  updateStage(@Param('id') id: string, @Body() updateStageDto: UpdateStageDto) {
    return this.transactionsService.updateStage(id, updateStageDto);
  }
}
