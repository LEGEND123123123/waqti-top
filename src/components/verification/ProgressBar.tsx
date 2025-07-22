import React from 'react';
import { Check } from 'lucide-react';
import { VerificationStep } from '../../types/verification';

interface ProgressBarProps {
  steps: VerificationStep[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
            step.current ? 'bg-[#2E86AB]' : step.completed ? 'bg-green-500' : 'bg-gray-300'
          }`}>
            {step.completed ? <Check size={20} /> : step.id}
          </div>
          <div className="ml-3 mr-8">
            <p className={`text-sm font-medium ${step.current ? 'text-[#2E86AB]' : 'text-gray-500'}`}>
              {step.title}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;