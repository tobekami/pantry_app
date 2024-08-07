"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import { auth, provider } from '../../lib/firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

const Login: React.FC = () => {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push('/pantry');
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <div>
      <h1>Please login to view your pantry</h1>
      <Button variant="contained" onClick={handleGoogleLogin}>Login with Google</Button>
    </div>
  );
};

export default Login;