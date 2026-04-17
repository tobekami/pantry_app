"use client";

import React from 'react';
import { Box, Container, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import DetectItemForm from '../../../components/DetectItemForm';

const DetectPage: React.FC = () => {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5FAFF', pb: 8 }}>
      {/* Frosted Glass Header */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 50, bgcolor: 'rgba(245, 250, 255, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Container maxWidth="md" sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.push('/pantry')} sx={{ color: '#486730', bgcolor: '#e9f5ff' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#486730' }}>
              AI Scanner
            </Typography>
            <Typography variant="body2" sx={{ color: '#5f5e59' }}>
              Snap a photo to detect and add items to your pantry.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ pt: 6 }}>
        <DetectItemForm />
      </Container>
    </Box>
  );
};

export default DetectPage;