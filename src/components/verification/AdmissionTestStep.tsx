import React from 'react';
import { AdmissionTest } from '../../types/verification';

interface AdmissionTestStepProps {
  data: AdmissionTest;
  onChange: (data: AdmissionTest) => void;
  errors: Record<string, string>;
}

const AdmissionTestStep: React.FC<AdmissionTestStepProps> = ({ data, onChange, errors }) => {
  const handleAnswerChange = (questionId: string, answer: string) => {
    onChange({
      ...data,
      answers: {
        ...data.answers,
        [questionId]: answer
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Admission Test</h2>
      
      <div className="space-y-6">
        {data.questions.map((question, index) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-4">
              Question {index + 1}: {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            
            <div className="space-y-2">
              {question.options.map(option => (
                <label key={option} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={option}
                    checked={data.answers[question.id] === option}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="text-[#2E86AB] focus:ring-[#2E86AB]"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            
            {errors[`question_${question.id}`] && (
              <p className="text-red-500 text-sm mt-2">{errors[`question_${question.id}`]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdmissionTestStep;