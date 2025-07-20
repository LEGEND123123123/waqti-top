import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Upload, Check, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { VerificationData, VerificationStep, AccountData, ProfileData, PortfolioWork, TestQuestion } from '../types/verification';
import Button from '../components/Button';

interface FreelancerVerificationPageProps {
  setActivePage: (page: string) => void;
}

const FreelancerVerificationPage: React.FC<FreelancerVerificationPageProps> = ({ setActivePage }) => {
  const [verificationData, setVerificationData] = useState<VerificationData>({
    accountData: {
      username: '',
      accountType: 'independent',
      termsAccepted: false
    },
    profileData: {
      fullName: '',
      bio: '',
      jobTitle: '',
      specialization: '',
      skills: [],
      introduction: ''
    },
    businessGallery: {
      works: [
        { id: '1', title: '', description: '', thumbnail: null },
        { id: '2', title: '', description: '', thumbnail: null },
        { id: '3', title: '', description: '', thumbnail: null }
      ],
      currentWork: 0
    },
    admissionTest: {
      questions: [
        {
          id: '1',
          question: 'What is the most important factor in delivering quality work?',
          type: 'single',
          options: ['Speed', 'Communication', 'Price', 'Experience'],
          correctAnswer: 'Communication',
          required: true
        },
        {
          id: '2',
          question: 'How do you handle client feedback?',
          type: 'single',
          options: ['Ignore it', 'Implement immediately', 'Discuss and clarify', 'Charge extra'],
          correctAnswer: 'Discuss and clarify',
          required: true
        }
      ],
      answers: {}
    },
    currentStep: 1,
    isComplete: false
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: VerificationStep[] = [
    { id: 1, title: 'Account data', completed: false, current: verificationData.currentStep === 1 },
    { id: 2, title: 'Profile', completed: false, current: verificationData.currentStep === 2 },
    { id: 3, title: 'Business Gallery', completed: false, current: verificationData.currentStep === 3 },
    { id: 4, title: 'Admission test', completed: false, current: verificationData.currentStep === 4 }
  ];

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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!verificationData.accountData.username.trim()) {
          newErrors.username = 'Username is required';
        } else if (!/^[a-zA-Z0-9_]+$/.test(verificationData.accountData.username)) {
          newErrors.username = 'Username must contain only letters, numbers, and underscores';
        }
        if (!verificationData.accountData.termsAccepted) {
          newErrors.terms = 'You must accept the terms and conditions';
        }
        break;
      case 2:
        if (!verificationData.profileData.jobTitle.trim()) {
          newErrors.jobTitle = 'Job title is required';
        }
        if (!verificationData.profileData.specialization) {
          newErrors.specialization = 'Specialization is required';
        }
        if (!verificationData.profileData.introduction.trim()) {
          newErrors.introduction = 'Introduction is required';
        }
        if (verificationData.profileData.skills.length === 0) {
          newErrors.skills = 'At least one skill is required';
        }
        break;
      case 3:
        const currentWork = verificationData.businessGallery.works[verificationData.businessGallery.currentWork];
        if (!currentWork.title.trim()) {
          newErrors.workTitle = 'Work title is required';
        }
        if (!currentWork.description.trim()) {
          newErrors.workDescription = 'Work description is required';
        }
        if (!currentWork.thumbnail) {
          newErrors.workThumbnail = 'Thumbnail image is required';
        }
        break;
      case 4:
        verificationData.admissionTest.questions.forEach(question => {
          if (question.required && !verificationData.admissionTest.answers[question.id]) {
            newErrors[`question_${question.id}`] = 'This question is required';
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(verificationData.currentStep)) {
      if (verificationData.currentStep === 3) {
        // Check if we need to move to next work or next step
        const nextWorkIndex = verificationData.businessGallery.currentWork + 1;
        if (nextWorkIndex < verificationData.businessGallery.works.length) {
          setVerificationData(prev => ({
            ...prev,
            businessGallery: {
              ...prev.businessGallery,
              currentWork: nextWorkIndex
            }
          }));
          return;
        }
      }
      
      if (verificationData.currentStep < 4) {
        setVerificationData(prev => ({
          ...prev,
          currentStep: prev.currentStep + 1
        }));
      } else {
        // Complete verification
        setVerificationData(prev => ({ ...prev, isComplete: true }));
        setActivePage('dashboard');
      }
    }
  };

  const prevStep = () => {
    if (verificationData.currentStep === 3 && verificationData.businessGallery.currentWork > 0) {
      setVerificationData(prev => ({
        ...prev,
        businessGallery: {
          ...prev.businessGallery,
          currentWork: prev.businessGallery.currentWork - 1
        }
      }));
    } else if (verificationData.currentStep > 1) {
      setVerificationData(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const currentWorkIndex = verificationData.businessGallery.currentWork;
      setVerificationData(prev => ({
        ...prev,
        businessGallery: {
          ...prev.businessGallery,
          works: prev.businessGallery.works.map((work, index) =>
            index === currentWorkIndex
              ? { ...work, thumbnail: file, thumbnailUrl: URL.createObjectURL(file) }
              : work
          )
        }
      }));
    }
  }, [verificationData.businessGallery.currentWork]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024 // 2MB
  });

  const addSkill = () => {
    if (currentSkill.trim() && !verificationData.profileData.skills.includes(currentSkill.trim())) {
      setVerificationData(prev => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          skills: [...prev.profileData.skills, currentSkill.trim()]
        }
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setVerificationData(prev => ({
      ...prev,
      profileData: {
        ...prev.profileData,
        skills: prev.profileData.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const addSuggestedSkill = (skill: string) => {
    if (!verificationData.profileData.skills.includes(skill)) {
      setVerificationData(prev => ({
        ...prev,
        profileData: {
          ...prev.profileData,
          skills: [...prev.profileData.skills, skill]
        }
      }));
    }
  };

  const renderStepContent = () => {
    switch (verificationData.currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-[#8B7355] rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                a
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Ahmed Alhabash</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> user name
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  https://mostaql.com/u/
                </span>
                <input
                  type="text"
                  value={verificationData.accountData.username}
                  onChange={(e) => setVerificationData(prev => ({
                    ...prev,
                    accountData: { ...prev.accountData, username: e.target.value }
                  }))}
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
                  verificationData.accountData.accountType === 'independent' 
                    ? 'border-[#2E86AB] bg-[#2E86AB] text-white' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="accountType"
                    value="independent"
                    checked={verificationData.accountData.accountType === 'independent'}
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      accountData: { ...prev.accountData, accountType: e.target.value as 'independent' | 'entrepreneur' }
                    }))}
                    className="sr-only"
                  />
                  <div className="mb-4">
                    <User size={48} className="mx-auto" />
                  </div>
                  <h3 className="font-semibold mb-2">Independent</h3>
                  <p className="text-sm">I am looking for projects to implement</p>
                </label>

                <label className={`cursor-pointer border-2 rounded-lg p-6 text-center transition-all ${
                  verificationData.accountData.accountType === 'entrepreneur' 
                    ? 'border-[#2E86AB] bg-gray-100' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="accountType"
                    value="entrepreneur"
                    checked={verificationData.accountData.accountType === 'entrepreneur'}
                    onChange={(e) => setVerificationData(prev => ({
                      ...prev,
                      accountData: { ...prev.accountData, accountType: e.target.value as 'independent' | 'entrepreneur' }
                    }))}
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
                checked={verificationData.accountData.termsAccepted}
                onChange={(e) => setVerificationData(prev => ({
                  ...prev,
                  accountData: { ...prev.accountData, termsAccepted: e.target.checked }
                }))}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                <span className="text-red-500">*</span> I have read and agree to{' '}
                <button className="text-[#2E86AB] hover:underline">the Terms of Use</button>
                {' '}and{' '}
                <button className="text-[#2E86AB] hover:underline">Privacy Statement</button>
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
          </div>
        );

      case 2:
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
                  value={verificationData.profileData.jobTitle}
                  onChange={(e) => setVerificationData(prev => ({
                    ...prev,
                    profileData: { ...prev.profileData, jobTitle: e.target.value }
                  }))}
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
                  value={verificationData.profileData.specialization}
                  onChange={(e) => setVerificationData(prev => ({
                    ...prev,
                    profileData: { ...prev.profileData, specialization: e.target.value }
                  }))}
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
                value={verificationData.profileData.introduction}
                onChange={(e) => setVerificationData(prev => ({
                  ...prev,
                  profileData: { ...prev.profileData, introduction: e.target.value }
                }))}
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
                <Button onClick={addSkill} variant="primary">Add</Button>
              </div>

              {verificationData.profileData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {verificationData.profileData.skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#2E86AB] text-white text-sm rounded-full"
                    >
                      {skill}
                      <button
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
                      onClick={() => addSuggestedSkill(skill)}
                      disabled={verificationData.profileData.skills.includes(skill)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        verificationData.profileData.skills.includes(skill)
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

      case 3:
        const currentWork = verificationData.businessGallery.works[verificationData.businessGallery.currentWork];
        const workNumber = verificationData.businessGallery.currentWork + 1;
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Add portfolio</h2>
            
            <div className="bg-gray-100 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-right mb-4">Add your portfolio</h3>
              <div className="text-right space-y-2 text-sm text-gray-700">
                <p>• Add your top 3 recent works that demonstrate your expertise in your field. The Mustaql team will review the works before accepting your application.</p>
                <p>• Add work that you have done yourself and that is not copied or transferred.</p>
                <p>• Ensure that the work is distinctive and of high quality.</p>
                <p>• Write a clear title and an accurate description that explains the features of the business.</p>
                <p>• Do not send blank or duplicate work.</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <ChevronLeft 
                  className={`cursor-pointer ${verificationData.businessGallery.currentWork === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={prevStep}
                />
                <h3 className="text-lg font-semibold">Work {workNumber} of 3</h3>
                <div className="w-6"></div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    <span className="text-red-500">*</span> Work title
                  </label>
                  <input
                    type="text"
                    value={currentWork.title}
                    onChange={(e) => {
                      const newWorks = [...verificationData.businessGallery.works];
                      newWorks[verificationData.businessGallery.currentWork] = {
                        ...currentWork,
                        title: e.target.value
                      };
                      setVerificationData(prev => ({
                        ...prev,
                        businessGallery: { ...prev.businessGallery, works: newWorks }
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2E86AB] focus:border-[#2E86AB]"
                    placeholder="Include a brief title that accurately describes the work"
                  />
                  {errors.workTitle && <p className="text-red-500 text-sm mt-1">{errors.workTitle}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    <span className="text-red-500">*</span> Thumbnail
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-[#2E86AB] bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    {currentWork.thumbnailUrl ? (
                      <div className="space-y-4">
                        <img
                          src={currentWork.thumbnailUrl}
                          alt="Work thumbnail"
                          className="max-h-32 mx-auto rounded"
                        />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="mx-auto text-gray-400" size={48} />
                        <div>
                          <p className="text-lg font-medium text-gray-700">Drag image here</p>
                          <p className="text-sm text-gray-500">Or click to select manually</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    Add an attractive image that expresses the work
                  </p>
                  {errors.workThumbnail && <p className="text-red-500 text-sm mt-1">{errors.workThumbnail}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    <span className="text-red-500">*</span> Job description
                  </label>
                  <textarea
                    value={currentWork.description}
                    onChange={(e) => {
                      const newWorks = [...verificationData.businessGallery.works];
                      newWorks[verificationData.businessGallery.currentWork] = {
                        ...currentWork,
                        description: e.target.value
                      };
                      setVerificationData(prev => ({
                        ...prev,
                        businessGallery: { ...prev.businessGallery, works: newWorks }
                      }));
                    }}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2E86AB] focus:border-[#2E86AB]"
                    placeholder="Add a detailed description that explains the features of the job"
                  />
                  {errors.workDescription && <p className="text-red-500 text-sm mt-1">{errors.workDescription}</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Admission Test</h2>
            
            <div className="space-y-6">
              {verificationData.admissionTest.questions.map((question, index) => (
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
                          checked={verificationData.admissionTest.answers[question.id] === option}
                          onChange={(e) => setVerificationData(prev => ({
                            ...prev,
                            admissionTest: {
                              ...prev.admissionTest,
                              answers: {
                                ...prev.admissionTest.answers,
                                [question.id]: e.target.value
                              }
                            }
                          }))}
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

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (verificationData.currentStep) {
      case 1: return 'Account Data';
      case 2: return 'Complete account information';
      case 3: return 'Add portfolio';
      case 4: return 'Admission Test';
      default: return '';
    }
  };

  const getButtonText = () => {
    if (verificationData.currentStep === 3) {
      const isLastWork = verificationData.businessGallery.currentWork === verificationData.businessGallery.works.length - 1;
      return isLastWork ? 'the next' : 'Next Work';
    }
    return verificationData.currentStep === 4 ? 'Submit Test' : 'the next';
  };

  const canGoBack = () => {
    return verificationData.currentStep > 1 || 
           (verificationData.currentStep === 3 && verificationData.businessGallery.currentWork > 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
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

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={verificationData.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={!canGoBack()}
              leftIcon={<ChevronLeft size={20} />}
            >
              Previous
            </Button>
            
            <Button
              variant="primary"
              onClick={nextStep}
              rightIcon={<ChevronRight size={20} />}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerVerificationPage;