"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import PersonIcon from '@mui/icons-material/Person';
import BlockIcon from '@mui/icons-material/Block';
import { auth } from '../lib/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Home: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url("/path-to-your-background-image.jpg")', // Replace with your image path
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white overlay
      }} />
      <div style={{
        position: 'relative',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
        }}>
          {user ? (
            <IconButton onClick={handleLogout} color="primary">
              <BlockIcon />
            </IconButton>
          ) : (
            <Link href="/login" passHref>
              <IconButton color="primary">
                <PersonIcon />
              </IconButton>
            </Link>
          )}
        </div>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
        }}>
          <h1 style={{
            marginBottom: '1rem',
          }}>Pantry Tracker</h1>
          <p style={{
            marginBottom: '2rem',
          }}>
            Experience seamless management for your food inventory. Pantry Tracker helps you organize, track, and optimize your pantry with ease.
          </p>
          <Link href="/pantry" passHref>
            <Button variant="contained" color="primary">
              View Pantry
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;