
import React from 'react';
// import { useKindeAuth } from '@kinde-oss/kinde-auth-react'; // Kinde Removed
// import LoadingSpinner from '../components/LoadingSpinner'; // Kinde Removed related loading

const ProfilePage: React.FC = () => {
  // const { user, isLoading } = useKindeAuth(); // Kinde Removed

  // if (isLoading) { // Kinde Removed
  //   return (
  //     <div className="flex justify-center items-center min-h-[60vh]">
  //       <LoadingSpinner />
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-2xl mx-auto bg-surface shadow-xl rounded-lg p-8 mt-10">
      <h1 className="text-3xl font-bold text-textPrimary mb-8 text-center">Perfil do Utilizador</h1>
      <p className="text-textSecondary text-center">
        A funcionalidade de perfis de utilizador não está ativa no momento.
      </p>
      {/* Removed Kinde user data display */}
    </div>
  );
};

export default ProfilePage;