export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  avatar?: string;
  joinedAt: Date;
  expertiseLevel?: 'beginner' | 'professional' | 'expert';
  isVerified?: boolean;
  identityVerified?: boolean;
  role?: 'freelancer' | 'client' | 'admin';
  verificationStatus?: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  provider: User;
  hourlyRate: number;
  location: string;
  rating: number;
  reviews: number;
  image: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
  serviceId?: string;
  receiverId?: string;
}

export interface Booking {
  id: string;
  service: Service;
  client: User;
  provider: User;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: Date;
  duration: number;
  totalHours: number;
}

export type Language = 'en' | 'ar';

export interface ExpertiseVerification {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  identityDocument?: string;
  selfieWithId?: string;
  resume?: string;
  portfolio?: string;
  certificates: string[];
  socialLinks: {
    linkedin?: string;
    github?: string;
    behance?: string;
  };
  expertiseLevel: 'beginner' | 'professional' | 'expert';
  verificationDate?: Date;
  category: string;
  skills: string[];
  yearsOfExperience: number;
}

// Additional types for the platform
export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  client: User;
  budget: {
    type: 'time' | 'money';
    amount: number;
    currency?: 'AED' | 'USD' | 'EUR';
  };
  skills: string[];
  deadline?: Date;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  isRemote: boolean;
  createdAt: Date;
  updatedAt: Date;
  proposals: Proposal[];
  urgency: 'low' | 'medium' | 'high';
  attachments?: string[];
}

export interface Proposal {
  id: string;
  projectId: string;
  freelancer: User;
  coverLetter: string;
  proposedBudget: {
    type: 'time' | 'money';
    amount: number;
    currency?: 'AED' | 'USD' | 'EUR';
  };
  deliveryTime: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}