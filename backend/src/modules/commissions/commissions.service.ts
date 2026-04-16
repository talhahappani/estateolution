import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

// Interface for the return type of our calculation
export interface CommissionResult {
  agencyEarning: number;
  agents: {
    agentId: Types.ObjectId;
    role: 'listing' | 'selling' | 'both';
    earning: number;
  }[];
}

@Injectable()
export class CommissionsService {
  /**
   * Calculates the commission breakdown based on company policy.
   * - 50% to Agency
   * - 50% to Agents (Split equally if different agents, 100% if same agent)
   */
  calculateCommission(
    totalServiceFee: number,
    listingAgentId: Types.ObjectId,
    sellingAgentId: Types.ObjectId,
  ): CommissionResult {
    const agencyEarning = totalServiceFee * 0.5;
    const agentPool = totalServiceFee * 0.5;

    // Use .equals() for comparing Mongoose ObjectIds, strictly avoiding '==='
    const isSameAgent = listingAgentId.equals(sellingAgentId);

    // Scenario 1: The listing and selling agent are the same person
    if (isSameAgent) {
      return {
        agencyEarning,
        agents: [
          {
            agentId: listingAgentId,
            role: 'both',
            earning: agentPool, // Gets 100% of the agent pool
          },
        ],
      };
    }

    // Scenario 2: The listing and selling agents are different
    return {
      agencyEarning,
      agents: [
        {
          agentId: listingAgentId,
          role: 'listing',
          earning: agentPool * 0.5, // Gets 50% of the agent pool (25% of total)
        },
        {
          agentId: sellingAgentId,
          role: 'selling',
          earning: agentPool * 0.5, // Gets 50% of the agent pool (25% of total)
        },
      ],
    };
  }
}
