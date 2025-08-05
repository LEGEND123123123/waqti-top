import { useState, useEffect } from 'react';
import { EscrowService } from '../services/escrowService';
import { EscrowTransaction } from '../types/verification';

export const useEscrow = (transactionId?: string) => {
  const [escrowData, setEscrowData] = useState<EscrowTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEscrow = async (
    clientId: string,
    freelancerId: string,
    serviceId: string,
    amount: number,
    terms: string
  ) => {
    setLoading(true);
    setError(null);

    const result = await EscrowService.createEscrow(
      clientId,
      freelancerId,
      serviceId,
      amount,
      terms
    );

    if (result.success) {
      // Fetch the created escrow data
      if (result.transactionId) {
        const statusResult = await EscrowService.getEscrowStatus(result.transactionId);
        if (statusResult.success) {
          setEscrowData(statusResult.data);
        }
      }
    } else {
      setError(result.error || 'Failed to create escrow');
    }

    setLoading(false);
    return result;
  };

  const releaseEscrow = async (freelancerId: string) => {
    if (!transactionId) return { success: false, error: 'No transaction ID' };

    setLoading(true);
    setError(null);

    const result = await EscrowService.releaseEscrow(transactionId, freelancerId);

    if (result.success) {
      // Update local state
      setEscrowData(prev => prev ? { ...prev, status: 'released' } : null);
    } else {
      setError(result.error || 'Failed to release escrow');
    }

    setLoading(false);
    return result;
  };

  const refundEscrow = async (clientId: string) => {
    if (!transactionId) return { success: false, error: 'No transaction ID' };

    setLoading(true);
    setError(null);

    const result = await EscrowService.refundEscrow(transactionId, clientId);

    if (result.success) {
      // Update local state
      setEscrowData(prev => prev ? { ...prev, status: 'refunded' } : null);
    } else {
      setError(result.error || 'Failed to refund escrow');
    }

    setLoading(false);
    return result;
  };

  useEffect(() => {
    if (transactionId) {
      const fetchEscrowData = async () => {
        setLoading(true);
        const result = await EscrowService.getEscrowStatus(transactionId);
        if (result.success) {
          setEscrowData(result.data);
        } else {
          setError(result.error || 'Failed to fetch escrow data');
        }
        setLoading(false);
      };

      fetchEscrowData();
    }
  }, [transactionId]);

  return {
    escrowData,
    loading,
    error,
    createEscrow,
    releaseEscrow,
    refundEscrow
  };
};