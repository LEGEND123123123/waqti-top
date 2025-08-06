import { supabase } from '../lib/supabase';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingVerifications: number;
  activeEscrows: number;
  totalTransactions: number;
  disputesOpen: number;
  monthlyRevenue: number;
  platformFees: number;
}

export class AdminService {
  static async getStats(): Promise<AdminStats> {
    try {
      const [
        usersResult,
        verificationsResult,
        escrowsResult,
        transactionsResult,
        disputesResult
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('freelancer_verifications').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('transactions').select('id', { count: 'exact' }).eq('status', 'held'),
        supabase.from('transactions').select('id', { count: 'exact' }),
        supabase.from('disputes').select('id', { count: 'exact' }).eq('status', 'open')
      ]);

      return {
        totalUsers: usersResult.count || 0,
        activeUsers: usersResult.count || 0, // Simplified for now
        pendingVerifications: verificationsResult.count || 0,
        activeEscrows: escrowsResult.count || 0,
        totalTransactions: transactionsResult.count || 0,
        disputesOpen: disputesResult.count || 0,
        monthlyRevenue: 0, // Calculate based on completed transactions
        platformFees: 0 // Calculate based on platform commission
      };
    } catch (error) {
      console.error('Get admin stats error:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        pendingVerifications: 0,
        activeEscrows: 0,
        totalTransactions: 0,
        disputesOpen: 0,
        monthlyRevenue: 0,
        platformFees: 0
      };
    }
  }

  static async getPendingVerifications(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('freelancer_verifications')
        .select(`
          *,
          user:users!user_id(name, email, avatar_url)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(verification => ({
        id: verification.id,
        user_id: verification.user_id,
        user_name: verification.user.name,
        email: verification.user.email,
        avatar_url: verification.user.avatar_url,
        job_title: verification.job_title,
        specialization: verification.specialization,
        skills: verification.skills,
        test_score: verification.test_score,
        test_passed: verification.test_passed,
        created_at: verification.created_at
      }));
    } catch (error) {
      console.error('Get pending verifications error:', error);
      return [];
    }
  }

  static async getActiveEscrows(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          client:users!client_id(name, avatar_url),
          freelancer:users!freelancer_id(name, avatar_url),
          service:services!service_id(title)
        `)
        .in('status', ['held', 'disputed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(transaction => ({
        id: transaction.id,
        client_id: transaction.client_id,
        freelancer_id: transaction.freelancer_id,
        client_name: transaction.client.name,
        freelancer_name: transaction.freelancer.name,
        service_title: transaction.service?.title || 'Unknown Service',
        amount: transaction.amount,
        status: transaction.status,
        auto_release_at: transaction.auto_release_at,
        dispute_reason: transaction.dispute_reason,
        created_at: transaction.created_at
      }));
    } catch (error) {
      console.error('Get active escrows error:', error);
      return [];
    }
  }

  static async updateVerificationStatus(
    verificationId: string,
    action: 'approve' | 'reject',
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update verification status
      const { data: verification, error: updateError } = await supabase
        .from('freelancer_verifications')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          admin_notes: notes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', verificationId)
        .select('user_id')
        .single();

      if (updateError) throw updateError;

      // Update user verification status if approved
      if (action === 'approve') {
        await supabase
          .from('users')
          .update({
            verification_status: 'completed',
            is_verified: true
          })
          .eq('id', verification.user_id);

        // Create notification
        await supabase.from('notifications').insert({
          user_id: verification.user_id,
          type: 'verification',
          title: 'Verification Approved',
          message: 'Congratulations! Your freelancer verification has been approved. You can now offer services on the platform.',
          priority: 'high'
        });
      } else {
        // Create rejection notification
        await supabase.from('notifications').insert({
          user_id: verification.user_id,
          type: 'verification',
          title: 'Verification Rejected',
          message: `Your freelancer verification has been rejected. ${notes || 'Please review your submission and try again.'}`,
          priority: 'high'
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update verification status error:', error);
      return { success: false, error: error.message };
    }
  }

  static async resolveEscrow(
    transactionId: string,
    action: 'release' | 'refund'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (action === 'release') {
        const { data, error } = await supabase.rpc('release_escrow', {
          transaction_id: transactionId
        });

        if (error) throw error;
        return { success: true };
      } else {
        const { data, error } = await supabase.rpc('refund_escrow', {
          transaction_id: transactionId,
          reason: 'Admin intervention'
        });

        if (error) throw error;
        return { success: true };
      }
    } catch (error: any) {
      console.error('Resolve escrow error:', error);
      return { success: false, error: error.message };
    }
  }

  static async getUserDetails(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          services:services!provider_id(count),
          bookings_as_client:bookings!client_id(count),
          bookings_as_provider:bookings!provider_id(count),
          reviews:reviews!provider_id(rating)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Get user details error:', error);
      return null;
    }
  }

  static async suspendUser(
    userId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          verification_status: 'rejected',
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Deactivate all user services
      await supabase
        .from('services')
        .update({ is_active: false })
        .eq('provider_id', userId);

      // Create notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'system',
        title: 'Account Suspended',
        message: `Your account has been suspended. Reason: ${reason}`,
        priority: 'urgent'
      });

      return { success: true };
    } catch (error: any) {
      console.error('Suspend user error:', error);
      return { success: false, error: error.message };
    }
  }

  static async getDisputeDetails(disputeId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          transaction:transactions!transaction_id(*),
          initiator:users!initiator_id(name, avatar_url),
          respondent:users!respondent_id(name, avatar_url)
        `)
        .eq('id', disputeId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Get dispute details error:', error);
      return null;
    }
  }

  static async resolveDispute(
    disputeId: string,
    resolution: string,
    action: 'release' | 'refund'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get dispute details
      const dispute = await this.getDisputeDetails(disputeId);
      if (!dispute) throw new Error('Dispute not found');

      // Resolve the escrow
      const escrowResult = await this.resolveEscrow(dispute.transaction_id, action);
      if (!escrowResult.success) throw new Error(escrowResult.error);

      // Update dispute status
      await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolution: resolution,
          resolved_by: user.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', disputeId);

      // Notify both parties
      await Promise.all([
        supabase.from('notifications').insert({
          user_id: dispute.initiator_id,
          type: 'system',
          title: 'Dispute Resolved',
          message: `Your dispute has been resolved. Resolution: ${resolution}`,
          priority: 'high'
        }),
        supabase.from('notifications').insert({
          user_id: dispute.respondent_id,
          type: 'system',
          title: 'Dispute Resolved',
          message: `A dispute against you has been resolved. Resolution: ${resolution}`,
          priority: 'high'
        })
      ]);

      return { success: true };
    } catch (error: any) {
      console.error('Resolve dispute error:', error);
      return { success: false, error: error.message };
    }
  }
}