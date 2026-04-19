import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { getModelToken } from '@nestjs/mongoose';
import { Transaction } from './schemas/transaction.schema';
import { CommissionsService } from '../commissions/commissions.service';
import { TransactionStatus } from '../../common/enums/transaction-status.enum';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let commissionsService: CommissionsService;

  // We create a mock function for saving the document
  const mockSave = jest.fn().mockImplementation(function (
    this: typeof mockTransactionDoc,
  ) {
    return Promise.resolve(this);
  });

  // A mock representation of a Transaction Document
  const mockTransactionDoc = {
    _id: new Types.ObjectId(),
    status: TransactionStatus.AGREEMENT,
    totalServiceFee: 10000,
    listingAgentId: { _id: new Types.ObjectId() },
    sellingAgentId: { _id: new Types.ObjectId() },
    stageHistory: [],
    save: mockSave,
  };

  // Mocking the Mongoose Model
  const mockTransactionModel = {
    findById: jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTransactionDoc),
      }),
    }),
  };

  beforeEach(async () => {
    // Reset the mock document state before each test
    mockTransactionDoc.status = TransactionStatus.AGREEMENT;
    mockTransactionDoc.stageHistory = [];
    mockSave.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel,
        },
        {
          provide: CommissionsService,
          useValue: {
            calculateCommission: jest
              .fn()
              .mockReturnValue({ agencyEarning: 5000, agents: [] }),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    commissionsService = module.get<CommissionsService>(CommissionsService);
  });

  describe('updateStage (State Machine Rules)', () => {
    it('should allow valid transition (AGREEMENT -> EARNEST_MONEY)', async () => {
      const result = await service.updateStage(
        'some-id',
        TransactionStatus.EARNEST_MONEY,
      );

      expect(result.status).toBe(TransactionStatus.EARNEST_MONEY);
      expect(result.stageHistory.length).toBe(1);
      expect(result.stageHistory[0].stage).toBe(
        TransactionStatus.EARNEST_MONEY,
      );
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw BadRequestException for skipping stages (AGREEMENT -> TITLE_DEED)', async () => {
      await expect(
        service.updateStage('some-id', TransactionStatus.TITLE_DEED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should trigger commission calculation when transitioned to COMPLETED', async () => {
      // First, manually set the mock state to TITLE_DEED so it's a valid transition
      mockTransactionDoc.status = TransactionStatus.TITLE_DEED;

      const result = await service.updateStage(
        'some-id',
        TransactionStatus.COMPLETED,
      );

      expect(result.status).toBe(TransactionStatus.COMPLETED);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(commissionsService.calculateCommission).toHaveBeenCalled();
      expect(result['financialBreakdown']).toBeDefined();
    });
  });

  describe('cancelTransaction', () => {
    it('should cancel an active transaction', async () => {
      const result = await service.cancelTransaction(
        'some-id',
        'Client withdrew',
      );

      expect(result.status).toBe(TransactionStatus.CANCELLED);
      expect(result['cancellationReason']).toBe('Client withdrew');
    });

    it('should throw error if trying to cancel a COMPLETED transaction', async () => {
      mockTransactionDoc.status = TransactionStatus.COMPLETED;

      await expect(
        service.cancelTransaction('some-id', 'Too late to cancel'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
