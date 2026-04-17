"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Stack,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';

// Icons
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LoginIcon from '@mui/icons-material/Login';

// Auth
import { auth } from '../lib/firebaseConfig';
import { signOut, User } from 'firebase/auth';

const LandingPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#F9FAF9',
      backgroundImage: 'url("/images/landing-wave-bg.jpg")', // Using the wavy background
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* 1. Navbar */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {/* Logo Section */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 40, height: 40, position: 'relative' }}>
              <Image
                src="/images/logo.png"
                alt="Smart Pantry Logo"
                fill
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2D3436' }}>
              Smart Pantry Tracker
            </Typography>
          </Stack>

          {/* Auth Button */}
          {user ? (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleLogout}
              sx={{ borderRadius: '8px', fontWeight: 600 }}
            >
              Sign Out
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              onClick={() => router.push('/login')}
              sx={{ borderRadius: '8px', px: 3, fontWeight: 600 }}
            >
              Login
            </Button>
          )}
        </Stack>
      </Container>

      {/* 2. Hero Section */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Grid container spacing={4} alignItems="center">

          {/* Left Column: Copy */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
              <Typography variant="h2" component="h1" sx={{
                fontWeight: 800,
                color: '#1A1A1A',
                mb: 2,
                lineHeight: 1.2
              }}>
                Stop Wasting Food. <br />
                <Box component="span" sx={{ color: theme.palette.primary.main }}>Track Smart.</Box>
              </Typography>

              <Typography variant="body1" sx={{
                color: '#636E72',
                fontSize: '1.1rem',
                mb: 4,
                maxWidth: '500px',
                mx: isMobile ? 'auto' : 0
              }}>
                Experience seamless management for your food inventory. Organize, track, and optimize your pantry with AI-powered insights.
              </Typography>

              <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={2}
                justifyContent={isMobile ? 'center' : 'flex-start'}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push(user ? '/pantry' : '/login')}
                  sx={{ py: 1.5, px: 4, borderRadius: '8px', fontSize: '1rem' }}
                >
                  Go to Pantry
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push(user ? '/dashboard' : '/login')}
                  sx={{
                    py: 1.5, px: 4,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    borderWidth: '2px',
                    '&:hover': { borderWidth: '2px' }
                  }}
                >
                  Go to Dashboard
                </Button>
              </Stack>
            </Box>
          </Grid>

          {/* Right Column: Hero Image */}
          <Grid item xs={12} md={6}>
            <Box sx={{
              position: 'relative',
              width: '100%',
              height: isMobile ? '300px' : '500px',
            }}>
              <Image
                src="/images/hero-food.png"
                alt="Healthy food illustration"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* 3. Features Section */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={3}>
          <FeatureCard
            icon={<CameraAltIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />}
            title="AI Object Detection"
            description="Automatically identify and categorize items as you add them to your pantry using our smart camera integration."
          />
          <FeatureCard
            icon={<RestaurantMenuIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />}
            title="Recipe Suggestions"
            description="Discover delicious new recipes based on the ingredients you already have in stock to reduce decision fatigue."
          />
          <FeatureCard
            icon={<ListAltIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />}
            title="Inventory Tracking"
            description="Keep a real-time inventory of your food, monitor expiry dates, and drastically reduce household food waste."
          />
        </Grid>
      </Container>
    </Box>
  );
};

// Sub-component for clean code
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Grid item xs={12} md={4}>
    <Card sx={{
      height: '100%',
      borderRadius: '16px',
      boxShadow: '0px 10px 40px rgba(0,0,0,0.05)',
      border: '1px solid rgba(0,0,0,0.02)'
    }}>
      <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{
          bgcolor: '#F0F7F2',
          width: 'fit-content',
          p: 1.5,
          borderRadius: '12px',
          mb: 1
        }}>
          {icon}
        </Box>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
);

export default LandingPage;