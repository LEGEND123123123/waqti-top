import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VerificationData, VerificationStep } from '../types/verification';
import Button from '../components/Button';
import ProgressBar from '../components/verification/ProgressBar';
import AccountDataStep from '../components/verification/AccountDataStep';
import ProfileStep from '../components/verification/ProfileStep';
import BusinessGalleryStep from '../components/verification/BusinessGalleryStep';
import AdmissionTestStep from '../components/verification/AdmissionTestStep';

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
        },
        {
          id: '3',
          question: 'What should you do if you cannot meet a deadline?',
          type: 'single',
          options: ['Say nothing', 'Inform client immediately', 'Deliver late without notice', 'Cancel the project'],
          correctAnswer: 'Inform client immediately',
          required: true
        },
        {
          id: '4',
          question: 'How do you ensure client satisfaction?',
          type: 'single',
          options: ['Deliver quickly', 'Regular communication and updates', 'Lowest price', 'Work alone'],
          correctAnswer: 'Regular communication and updates',
          required: true
        }
      ],
      answers: {}
    },
    currentStep: 1,
    isComplete: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps: VerificationStep[] = [
    { id: 1, title: 'Account data', completed: false, current: verificationData.currentStep === 1 },
    { id: 2, title: 'Profile', completed: false, current: verificationData.currentStep === 2 },
    { id: 3, title: 'Business Gallery', completed: false, current: verificationData.currentStep === 3 },
    { id: 4, title: 'Admission test', completed: false, current: verificationData.currentStep === 4 }
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

  const handlePrevWork = () => {
    if (verificationData.businessGallery.currentWork > 0) {
      setVerificationData(prev => ({
        ...prev,
        businessGallery: {
          ...prev.businessGallery,
          currentWork: prev.businessGallery.currentWork - 1
        }
      }));
    }
  };

  const handleNextWork = () => {
    const currentWork = verificationData.businessGallery.works[verificationData.businessGallery.currentWork];
    if (currentWork.title.trim() && currentWork.description.trim() && currentWork.thumbnail) {
      if (verificationData.businessGallery.currentWork < verificationData.businessGallery.works.length - 1) {
        setVerificationData(prev => ({
          ...prev,
          businessGallery: {
            ...prev.businessGallery,
            currentWork: prev.businessGallery.currentWork + 1
          }
        }));
      }
    }
  };

  const renderStepContent = () => {
    switch (verificationData.currentStep) {
      case 1:
        return (
          <AccountDataStep
            data={verificationData.accountData}
            onChange={(accountData) => setVerificationData(prev => ({ ...prev, accountData }))}
            errors={errors}
          />
        );
      case 2:
        return (
          <ProfileStep
            data={verificationData.profileData}
            onChange={(profileData) => setVerificationData(prev => ({ ...prev, profileData }))}
            errors={errors}
          />
        );
      case 3:
        return (
          <BusinessGalleryStep
            data={verificationData.businessGallery}
            onChange={(businessGallery) => setVerificationData(prev => ({ ...prev, businessGallery }))}
            errors={errors}
            onPrevWork={handlePrevWork}
            onNextWork={handleNextWork}
            canGoPrev={verificationData.businessGallery.currentWork > 0}
            canGoNext={verificationData.businessGallery.currentWork < verificationData.businessGallery.works.length - 1}
          />
        );
      case 4:
        return (
          <AdmissionTestStep
            data={verificationData.admissionTest}
            onChange={(admissionTest) => setVerificationData(prev => ({ ...prev, admissionTest }))}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const getButtonText = () => {
    if (verificationData.currentStep === 3) {
      const isLastWork = verificationData.businessGallery.currentWork === verificationData.businessGallery.works.length - 1;
      return isLastWork ? 'Next Step' : 'Next Work';
    }
    return verificationData.currentStep === 4 ? 'Submit Test' : 'Next Step';
  };

  const canGoBack = () => {
    return verificationData.currentStep > 1 || 
           (verificationData.currentStep === 3 && verificationData.businessGallery.currentWork > 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <ProgressBar steps={steps} />

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