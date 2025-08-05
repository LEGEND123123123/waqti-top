import React from 'react';
import { Clock, CheckCircle, AlertCircle, Shield } from 'lucide-react';

interface TimelineMilestone {
  label: string;
  status: 'completed' | 'current' | 'pending' | 'disputed';
  timestamp?: Date;
}

interface EscrowTimelineProps {
  status: 'held' | 'released' | 'disputed' | 'refunded';
  milestones: TimelineMilestone[];
  autoReleaseAt?: Date;
}

const EscrowTimeline: React.FC<EscrowTimelineProps> = ({ status, milestones, autoReleaseAt }) => {
  const getStatusIcon = (milestoneStatus: string) => {
    switch (milestoneStatus) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'disputed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (milestoneStatus: string) => {
    switch (milestoneStatus) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'current':
        return 'border-blue-500 bg-blue-50';
      case 'disputed':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const formatTimeRemaining = () => {
    if (!autoReleaseAt) return null;
    
    const now = new Date();
    const diff = autoReleaseAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff <= 0) return 'Auto-release time reached';
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-[#2E86AB]" />
        <h3 className="text-lg font-semibold text-gray-900">Escrow Status</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          status === 'held' ? 'bg-yellow-100 text-yellow-800' :
          status === 'released' ? 'bg-green-100 text-green-800' :
          status === 'disputed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Auto-release countdown */}
      {status === 'held' && autoReleaseAt && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Auto-release: {formatTimeRemaining()}</span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <div key={index} className={`flex items-start gap-4 p-4 rounded-lg border-2 ${getStatusColor(milestone.status)}`}>
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon(milestone.status)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{milestone.label}</p>
              {milestone.timestamp && (
                <p className="text-sm text-gray-600">
                  {milestone.timestamp.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EscrowTimeline;