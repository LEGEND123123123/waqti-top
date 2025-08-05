import React from 'react';
import { Check } from 'lucide-react';
import { VerificationStep } from '../../types/verification';

interface ProgressBarProps {
  steps: VerificationStep[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold transition-colors ${
                step.completed ? 'bg-green-500' : step.current ? 'bg-[#2E86AB]' : 'bg-gray-300'
              }`}>
                {step.completed ? <Check size={20} /> : step.id}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${step.current ? 'text-[#2E86AB]' : 'text-gray-500'}`}>
                  {step.title}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mt-5 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;