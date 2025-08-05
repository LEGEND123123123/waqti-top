import React from 'react';
import { User, Briefcase } from 'lucide-react';
import { AccountData } from '../../types/verification';

interface AccountDataStepProps {
  data: AccountData;
  onChange: (data: AccountData) => void;
  errors: Record<string, string>;
}

const AccountDataStep: React.FC<AccountDataStepProps> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-[#8B7355] rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
          {data.username ? data.username.charAt(0).toUpperCase() : 'A'}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Account Setup</h2>
        <p className="text-gray-600 mt-2">Create your unique username and select account type</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="text-red-500">*</span> Username
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            https://waqti.com/u/
          </span>
          <input
            type="text"
            value={data.username}
            onChange={(e) => onChange({ ...data, username: e.target.value })}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-[#2E86AB] focus:border-[#2E86AB]"
            placeholder="Ahmad_1_1"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          It must be unique and contain only letters, numbers, and underscores (_). It cannot be changed later
        </p>
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          <span className="text-red-500">*</span> Account type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`cursor-pointer border-2 rounded-lg p-6 text-center transition-all ${
            data.accountType === 'independent' 
              ? 'border-[#2E86AB] bg-[#2E86AB] text-white' 
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="radio"
              name="accountType"
              value="independent"
              checked={data.accountType === 'independent'}
              onChange={(e) => onChange({ ...data, accountType: e.target.value as 'independent' | 'entrepreneur' })}
              className="sr-only"
            />
            <div className="mb-4">
              <User size={48} className="mx-auto" />
            </div>
            <h3 className="font-semibold mb-2">Independent</h3>
            <p className="text-sm">I am looking for projects to implement</p>
          </label>

          <label className={`cursor-pointer border-2 rounded-lg p-6 text-center transition-all ${
            data.accountType === 'entrepreneur' 
              ? 'border-[#2E86AB] bg-gray-100' 
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="radio"
              name="accountType"
              value="entrepreneur"
              checked={data.accountType === 'entrepreneur'}
              onChange={(e) => onChange({ ...data, accountType: e.target.value as 'independent' | 'entrepreneur' })}
              className="sr-only"
            />
            <div className="mb-4">
              <Briefcase size={48} className="mx-auto" />
            </div>
            <h3 className="font-semibold mb-2">Entrepreneur</h3>
            <p className="text-sm">I am looking for freelancers to implement my projects</p>
          </label>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          checked={data.termsAccepted}
          onChange={(e) => onChange({ ...data, termsAccepted: e.target.checked })}
          className="mt-1 rounded border-gray-300 text-[#2E86AB] focus:ring-[#2E86AB]"
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          <span className="text-red-500">*</span> I have read and agree to{' '}
          <button type="button" className="text-[#2E86AB] hover:underline">the Terms of Use</button>
          {' '}and{' '}
          <button type="button" className="text-[#2E86AB] hover:underline">Privacy Statement</button>
        </label>
      </div>
      {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
    </div>
  );
};

export default AccountDataStep;