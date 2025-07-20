import React, { useState } from 'react';
import { User, Briefcase, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';

interface RoleSelectionPageProps {
  onRoleSelect: (role: 'freelancer' | 'client') => void;
  setActivePage: (page: string) => void;
}

const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onRoleSelect, setActivePage }) => {
  const { isRTL } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'client' | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  const roles = [
    {
      type: 'freelancer' as const,
      title: 'Independent',
      subtitle: 'I am looking for projects to implement',
      description: 'Submit proposals & earn hours',
      icon: User,
      color: 'bg-[#2E86AB]',
      hoverColor: 'hover:bg-[#1e5f7a]'
    },
    {
      type: 'client' as const,
      title: 'Entrepreneur', 
      subtitle: 'I am looking for freelancers to implement my projects',
      description: 'Post projects & manage offers',
      icon: Briefcase,
      color: 'bg-gray-600',
      hoverColor: 'hover:bg-gray-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Account Type</h1>
          <p className="text-gray-600 text-lg">Select how you want to use the Waqti platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.type;
            
            return (
              <motion.div
                key={role.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                  isSelected 
                    ? 'border-[#2E86AB] bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                }`}
                onClick={() => setSelectedRole(role.type)}
              >
                <div className="p-8 text-center">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-white ${role.color}`}>
                    <Icon size={40} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-gray-700 mb-4 text-lg">{role.subtitle}</p>
                  <p className="text-gray-600">{role.description}</p>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-4 right-4 w-6 h-6 bg-[#2E86AB] rounded-full flex items-center justify-center"
                    >
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center space-y-4">
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            disabled={!selectedRole}
            rightIcon={<ArrowRight size={20} />}
            className="px-8"
          >
            Continue
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <input type="checkbox" id="terms" className="rounded" required />
            <label htmlFor="terms">
              I have read and agree to the{' '}
              <button
                onClick={() => setActivePage('terms')}
                className="text-[#2E86AB] hover:underline"
              >
                Terms of Use
              </button>
              {' '}and{' '}
              <button
                onClick={() => setActivePage('privacy')}
                className="text-[#2E86AB] hover:underline"
              >
                Privacy Statement
              </button>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelectionPage;