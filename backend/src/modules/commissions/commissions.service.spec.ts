import { Test, TestingModule } from '@nestjs/testing';
import { CommissionsService } from './commissions.service';
import { Types } from 'mongoose';

describe('CommissionsService', () => {
  let service: CommissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommissionsService],
    }).compile();

    service = module.get<CommissionsService>(CommissionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCommission', () => {
    const totalServiceFee = 10000;

    it('Scenario 1: Should give 100% of agent pool to the same agent', () => {
      // Both IDs are exactly the same
      const agentId = new Types.ObjectId();

      const result = service.calculateCommission(
        totalServiceFee,
        agentId,
        agentId,
      );

      // Agency always gets 50%
      expect(result.agencyEarning).toBe(5000);

      // Since it's the same agent, the array should have 1 item
      expect(result.agents.length).toBe(1);
      expect(result.agents[0].role).toBe('both');
      expect(result.agents[0].earning).toBe(5000); // 100% of the remaining 50%
      expect(result.agents[0].agentId.toString()).toBe(agentId.toString());
    });

    it('Scenario 2: Should split agent pool 50/50 between different agents', () => {
      // Different IDs
      const listingAgentId = new Types.ObjectId();
      const sellingAgentId = new Types.ObjectId();

      const result = service.calculateCommission(
        totalServiceFee,
        listingAgentId,
        sellingAgentId,
      );

      // Agency gets 50%
      expect(result.agencyEarning).toBe(5000);

      // Array should have 2 items (listing and selling)
      expect(result.agents.length).toBe(2);

      const listingAgent = result.agents.find((a) => a.role === 'listing');
      const sellingAgent = result.agents.find((a) => a.role === 'selling');

      expect(listingAgent).toBeDefined();
      expect(sellingAgent).toBeDefined();

      // Each gets 25% of total (50% of the agent pool)
      expect(listingAgent?.earning).toBe(2500);
      expect(sellingAgent?.earning).toBe(2500);
    });
  });
});
