import React, { useState } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEscrow } from '../hooks/useEscrow';
import Button from './Button';

interface EscrowAgreementProps {
  serviceId: string;
  freelancerId: string;
  amount: number;
  terms: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

const EscrowAgreement: React.FC<EscrowAgreementProps> = ({
  serviceId,
  freelancerId,
  amount,
  terms,
  onSuccess,
  onCancel
}) => {
  const [agreed, setAgreed] = useState(false);
  const { createEscrow, loading, error } = useEscrow();

  const handleCreateEscrow = async () => {
    if (!agreed) return;

    const result = await createEscrow(
      'current-user-id', // This should come from auth context
      freelancerId,
      serviceId,
      amount,
      terms
    );

    if (result.success && result.transactionId) {
      onSuccess(result.transactionId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 text-[#2E86AB] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Escrow Agreement</h2>
          <p className="text-gray-600">Secure your time credits until service completion</p>
        </div>

        {/* Escrow Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Transaction Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">Service #{serviceId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium text-[#F18F01]">{amount} Hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Auto-release:</span>
              <span className="font-medium">72 hours after completion</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Service Terms
          </h3>
          <div className="text-gray-700 whitespace-pre-line text-sm">
            {terms}
          </div>
        </div>

        {/* How Escrow Works */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">How Escrow Works</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#2E86AB] text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium text-gray-900">Secure Deposit</p>
                <p className="text-gray-600 text-sm">Your {amount} hours are held securely in escrow</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#2E86AB] text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium text-gray-900">Service Delivery</p>
                <p className="text-gray-600 text-sm">Freelancer completes the work according to terms</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#2E86AB] text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium text-gray-900">Automatic Release</p>
                <p className="text-gray-600 text-sm">Hours are released to freelancer after 72 hours or your approval</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Agreement Checkbox */}
        <div className="flex items-start gap-3 mb-6">
          <input
            type="checkbox"
            id="escrow-agreement"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 rounded border-gray-300 text-[#2E86AB] focus:ring-[#2E86AB]"
          />
          <label htmlFor="escrow-agreement" className="text-sm text-gray-700">
            I understand and agree to the escrow terms. My {amount} hours will be held securely until service completion.
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateEscrow}
            disabled={!agreed || loading}
            isLoading={loading}
            className="flex-1"
          >
            Create Escrow
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EscrowAgreement;