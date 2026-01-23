// hooks/useAdminAuth.js

import { useState } from 'react';

// This custom hook encapsulates all logic for the admin password
export default function useAdminAuth(correctPassword, onLoginSuccess) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  const handleAdminLogin = () => {
    if (adminPasswordInput === correctPassword) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ss_admin_authed_v1', '1');
      }
      setShowPasswordInput(false);
      setAdminPasswordInput('');
      onLoginSuccess(); // Call the success function passed from the parent
    } else {
      alert('Incorrect password!');
      setAdminPasswordInput('');
    }
  };

  return {
    showPasswordInput,
    setShowPasswordInput,
    adminPasswordInput,
    setAdminPasswordInput,
    handleAdminLogin,
  };
}