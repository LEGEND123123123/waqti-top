export interface VerificationStep {
  id: number;
  title: string;
  completed: boolean;
  current: boolean;
}

export interface AccountData {
  username: string;
  accountType: 'independent' | 'entrepreneur';
  termsAccepted: boolean;
}

export interface ProfileData {
  fullName: string;
  bio: string;
  jobTitle: string;
  specialization: string;
  skills: string[];
  introduction: string;
}

export interface PortfolioWork {
  id: string;
  title: string;
  description: string;
  thumbnail: File | null;
  thumbnailUrl?: string;
}

export interface BusinessGallery {
  works: PortfolioWork[];
  currentWork: number;
}

export interface AdmissionTest {
  questions: TestQuestion[];
  answers: Record<string, any>;
  score?: number;
  passed?: boolean;
}

export interface TestQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  correctAnswer: string | string[];
  required: boolean;
}

export interface VerificationData {
  accountData: AccountData;
  profileData: ProfileData;
  businessGallery: BusinessGallery;
  admissionTest: AdmissionTest;
  currentStep: number;
  isComplete: boolean;
}

export interface UserRole {
  type: 'freelancer' | 'client';
  permissions: string[];
  verificationRequired: boolean;
  verificationStatus?: 'pending' | 'in_progress' | 'completed' | 'rejected';
}