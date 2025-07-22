import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ProfileData } from '../../types/verification';

interface ProfileStepProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  errors: Record<string, string>;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ data, onChange, errors }) => {
  const [currentSkill, setCurrentSkill] = useState('');

  const specializations = [
    'Programming, website and application development',
    'Business and consulting services',
    'Design and creative arts',
    'Writing and translation',
    'Digital marketing',
    'Data entry and virtual assistance'
  ];

  const suggestedSkills = [
    'Python', 'User Interface Design', 'psychology', 'Product label design',
    'Interior design', 'jQuery', 'e-marketing', 'Troubleshooting',
    'Create a landing page', 'Startup Consulting', 'Facebook marketing',
    'video editing', 'Flyer design', 'Proofreading', 'Content rewriting'
  ];

  const addSkill = () => {
    if (currentSkill.trim() && !data.skills.includes(currentSkill.trim())) {
      onChange({
        ...data,
        skills: [...data.skills, currentSkill.trim()]
      });
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange({
      ...data,
      skills: data.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addSuggestedSkill = (skill: string) => {
    if (!data.skills.includes(skill)) {
      onChange({
        ...data,
        skills: [...data.skills, skill]
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Complete account information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Job title
          </label>
          <input
            type="text"
            value={data.jobTitle}
            onChange={(e) => onChange({ ...data, jobTitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2E86AB] focus:border-[#2E86AB]"
            placeholder="مسوق رقمي"
          />
          <p className="text-xs text-gray-500 mt-1">Enter a job title such as: Architect</p>
          {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="text-red-500">*</span> Specialization
          </label>
          <select
            value={data.specialization}
            onChange={(e) => onChange({ ...data, specialization: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2E86AB] focus:border-[#2E86AB]"
          >
            <option value="">Choose your field of work</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
          {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="text-red-500">*</span> Introduction
        </label>
        <textarea
          value={data.introduction}
          onChange={(e) => onChange({ ...data, introduction: e.target.value })}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2E86AB] focus:border-[#2E86AB]"
          placeholder="مرحبا"
        />
        <p className="text-xs text-gray-500 mt-1">
          Add a resume that tells about yourself, your education, experience, and skills
        </p>
        {errors.introduction && <p className="text-red-500 text-sm mt-1">{errors.introduction}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <span className="text-red-500">*</span> Skills
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={currentSkill}
            onChange={(e) => setCurrentSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2E86AB] focus:border-[#2E86AB]"
            placeholder="Add a skill"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-[#2E86AB] text-white rounded-lg hover:bg-[#1e5f7a]"
          >
            Add
          </button>
        </div>

        {data.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {data.skills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#2E86AB] text-white text-sm rounded-full"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-white hover:text-gray-200"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Suggested skills</p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSuggestedSkill(skill)}
                disabled={data.skills.includes(skill)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  data.skills.includes(skill)
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#2E86AB] hover:text-[#2E86AB]'
                }`}
              >
                {skill} +
              </button>
            ))}
          </div>
        </div>
        {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
      </div>
    </div>
  );
};

export default ProfileStep;