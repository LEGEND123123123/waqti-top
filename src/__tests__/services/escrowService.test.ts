import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EscrowService } from '../../services/escrowService';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase');

describe('EscrowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEscrow', () => {
    it('should create escrow transaction successfully', async () => {
      const mockUser = { id: 'client-id' };
      const mockResponse = { data: 'transaction-id', error: null };
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });
      vi.mocked(supabase.rpc).mockResolvedValue(mockResponse);

      const result = await EscrowService.createEscrow(
        'client-id',
        'freelancer-id',
        'service-id',
        5,
        'Service terms'
      );

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('transaction-id');
      expect(supabase.rpc).toHaveBeenCalledWith('create_escrow_transaction', {
        client_id: 'client-id',
        freelancer_id: 'freelancer-id',
        service_id: 'service-id',
        amount: 5,
        terms: 'Service terms'
      });
    });

    it('should handle insufficient balance error', async () => {
      const mockUser = { id: 'client-id' };
      const mockError = new Error('Insufficient balance');
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });
      vi.mocked(supabase.rpc).mockRejectedValue(mockError);

      const result = await EscrowService.createEscrow(
        'client-id',
        'freelancer-id',
        'service-id',
        5,
        'Service terms'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient balance');
    });

    it('should handle unauthenticated user', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: null });

      const result = await EscrowService.createEscrow(
        'client-id',
        'freelancer-id',
        'service-id',
        5,
        'Service terms'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
    });
  });

  describe('releaseEscrow', () => {
    it('should release escrow successfully', async () => {
      const mockResponse = { data: true, error: null };
      vi.mocked(supabase.rpc).mockResolvedValue(mockResponse);

      const result = await EscrowService.releaseEscrow('transaction-id');

      expect(result.success).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('release_escrow', {
        transaction_id: 'transaction-id'
      });
    });

    it('should handle release failure', async () => {
      const mockError = new Error('Transaction not found');
      vi.mocked(supabase.rpc).mockRejectedValue(mockError);

      const result = await EscrowService.releaseEscrow('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Transaction not found');
    });
  });

  describe('getEscrowStatus', () => {
    it('should return escrow transaction details', async () => {
      const mockTransaction = {
        id: 'transaction-id',
        client_id: 'client-id',
        freelancer_id: 'freelancer-id',
        service_id: 'service-id',
        amount: 5,
        status: 'held',
        terms: 'Service terms',
        auto_release_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTransaction, error: null })
      } as any);

      const result = await EscrowService.getEscrowStatus('transaction-id');

      expect(result).toBeTruthy();
      expect(result?.id).toBe('transaction-id');
      expect(result?.amount).toBe(5);
      expect(result?.status).toBe('held');
    });

    it('should handle transaction not found', async () => {
      const mockError = new Error('Transaction not found');
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(mockError)
      } as any);

      const result = await EscrowService.getEscrowStatus('invalid-id');

      expect(result).toBeNull();
    });
  });
});