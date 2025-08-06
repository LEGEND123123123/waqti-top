import { supabase } from '../lib/supabase';
import { VerificationData } from '../types/verification';

export class VerificationService {
  static async saveVerificationStep(
    step: number,
    data: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('verification_submissions')
        .upsert({
          user_id: user.id,
          step: step,
          data: data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Save verification step error:', error);
      return { success: false, error: error.message };
    }
  }

  static async getVerificationData(userId: string): Promise<VerificationData | null> {
    try {
      const { data, error } = await supabase
        .from('freelancer_verifications')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) return null;

      return {
        accountData: {
          username: data.username,
          accountType: data.account_type,
          termsAccepted: true
        },
        profileData: {
          fullName: '', // Will be filled from user profile
          bio: data.introduction,
          jobTitle: data.job_title,
          specialization: data.specialization,
          skills: data.skills || [],
          introduction: data.introduction
        },
        businessGallery: {
          works: data.portfolio_items || [],
          currentWork: 0
        },
        admissionTest: {
          questions: [], // Will be loaded separately
          answers: data.test_answers || {},
          score: data.test_score,
          passed: data.test_passed
        },
        currentStep: 1,
        isComplete: data.status === 'approved'
      };
    } catch (error) {
      console.error('Get verification data error:', error);
      return null;
    }
  }

  static async submitVerification(
    verificationData: VerificationData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate test score
      const testScore = this.calculateTestScore(verificationData.admissionTest);
      const testPassed = testScore >= 70; // 70% passing score

      const { error } = await supabase
        .from('freelancer_verifications')
        .upsert({
          user_id: user.id,
          username: verificationData.accountData.username,
          account_type: verificationData.accountData.accountType,
          job_title: verificationData.profileData.jobTitle,
          specialization: verificationData.profileData.specialization,
          skills: verificationData.profileData.skills,
          introduction: verificationData.profileData.introduction,
          portfolio_items: verificationData.businessGallery.works,
          test_answers: verificationData.admissionTest.answers,
          test_score: testScore,
          test_passed: testPassed,
          status: testPassed ? 'pending' : 'rejected',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update user role if test passed
      if (testPassed) {
        await supabase
          .from('users')
          .update({ 
            verification_status: 'in_progress',
            role: 'freelancer'
          })
          .eq('id', user.id);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Submit verification error:', error);
      return { success: false, error: error.message };
    }
  }

  static async uploadPortfolioImage(
    file: File,
    userId: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('portfolio')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('Upload portfolio image error:', error);
      return { success: false, error: error.message };
    }
  }

  static async getAdmissionTestQuestions(): Promise<any[]> {
    // Return standardized test questions
    return [
      {
        id: '1',
        question: 'What is the most important factor in delivering quality work to clients?',
        type: 'single',
        options: [
          'Completing work as quickly as possible',
          'Clear communication and understanding requirements',
          'Offering the lowest price',
          'Using the most advanced tools'
        ],
        correctAnswer: 'Clear communication and understanding requirements',
        required: true
      },
      {
        id: '2',
        question: 'How should you handle client feedback and revision requests?',
        type: 'single',
        options: [
          'Ignore feedback if you disagree',
          'Implement all changes immediately without discussion',
          'Discuss feedback professionally and clarify requirements',
          'Charge extra for any revisions'
        ],
        correctAnswer: 'Discuss feedback professionally and clarify requirements',
        required: true
      },
      {
        id: '3',
        question: 'What should you do if you realize you cannot meet an agreed deadline?',
        type: 'single',
        options: [
          'Say nothing and deliver late',
          'Inform the client immediately and discuss alternatives',
          'Cancel the project without explanation',
          'Deliver incomplete work on time'
        ],
        correctAnswer: 'Inform the client immediately and discuss alternatives',
        required: true
      },
      {
        id: '4',
        question: 'How do you ensure client satisfaction throughout a project?',
        type: 'single',
        options: [
          'Work in isolation and deliver at the end',
          'Provide regular updates and seek feedback',
          'Focus only on technical requirements',
          'Complete work as quickly as possible'
        ],
        correctAnswer: 'Provide regular updates and seek feedback',
        required: true
      },
      {
        id: '5',
        question: 'What is the best approach when you encounter a technical challenge?',
        type: 'single',
        options: [
          'Pretend you know the solution',
          'Research, learn, and ask for help if needed',
          'Abandon the project',
          'Deliver a partial solution without explanation'
        ],
        correctAnswer: 'Research, learn, and ask for help if needed',
        required: true
      }
    ];
  }

  private static calculateTestScore(admissionTest: any): number {
    const questions = this.getAdmissionTestQuestions();
    let correctAnswers = 0;

    questions.forEach(question => {
      if (admissionTest.answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    return Math.round((correctAnswers / questions.length) * 100);
  }
}