import { supabase } from '../lib/supabase';
import { EscrowTransaction, EscrowApproval } from '../types/verification';

export class EscrowService {
  // Create escrow transaction
  static async createEscrow(
    clientId: string,
    freelancerId: string,
    serviceId: string,
    amount: number,
    terms: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Check client balance first
      const { data: clientWallet } = await supabase
        .from('users')
        .select('balance')
        .eq('id', clientId)
        .single();

      if (!clientWallet || clientWallet.balance < amount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Deduct from client balance
      const { error: deductError } = await supabase
        .from('users')
        .update({ balance: clientWallet.balance - amount })
        .eq('id', clientId);

      if (deductError) throw deductError;

      // Create escrow transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          type: 'debit',
          amount: amount,
          description: `Escrow for service ${serviceId}`,
          booking_id: serviceId
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      return { success: true, transactionId: transaction.id };
    } catch (error) {
      console.error('Escrow creation error:', error);
      return { success: false, error: 'Failed to create escrow' };
    }
  }

  // Release escrow to freelancer
  static async releaseEscrow(
    transactionId: string,
    freelancerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get transaction details
      const { data: transaction } = await supabase
        .from('transactions')
        .select('amount')
        .eq('id', transactionId)
        .single();

      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      // Get freelancer current balance
      const { data: freelancerWallet } = await supabase
        .from('users')
        .select('balance')
        .eq('id', freelancerId)
        .single();

      if (!freelancerWallet) {
        return { success: false, error: 'Freelancer not found' };
      }

      // Credit freelancer balance
      const { error: creditError } = await supabase
        .from('users')
        .update({ balance: freelancerWallet.balance + transaction.amount })
        .eq('id', freelancerId);

      if (creditError) throw creditError;

      // Create credit transaction for freelancer
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: freelancerId,
          type: 'credit',
          amount: transaction.amount,
          description: `Payment received for service completion`
        });

      if (transactionError) throw transactionError;

      return { success: true };
    } catch (error) {
      console.error('Escrow release error:', error);
      return { success: false, error: 'Failed to release escrow' };
    }
  }

  // Refund escrow to client
  static async refundEscrow(
    transactionId: string,
    clientId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get transaction details
      const { data: transaction } = await supabase
        .from('transactions')
        .select('amount')
        .eq('id', transactionId)
        .single();

      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      // Get client current balance
      const { data: clientWallet } = await supabase
        .from('users')
        .select('balance')
        .eq('id', clientId)
        .single();

      if (!clientWallet) {
        return { success: false, error: 'Client not found' };
      }

      // Refund client balance
      const { error: refundError } = await supabase
        .from('users')
        .update({ balance: clientWallet.balance + transaction.amount })
        .eq('id', clientId);

      if (refundError) throw refundError;

      // Create refund transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          type: 'credit',
          amount: transaction.amount,
          description: `Refund for cancelled service`
        });

      if (transactionError) throw transactionError;

      return { success: true };
    } catch (error) {
      console.error('Escrow refund error:', error);
      return { success: false, error: 'Failed to refund escrow' };
    }
  }

  // Get escrow status
  static async getEscrowStatus(transactionId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Get escrow status error:', error);
      return { success: false, error: 'Failed to get escrow status' };
    }
  }
}