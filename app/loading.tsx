"use client";

import { Box, CircularProgress } from '@mui/material';

export default function Loading() {
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      alignItems: 'center', 
      justifyContent: 'center', 
      bgcolor: '#F5FAFF',
      position: 'fixed', 
      top: 0, 
      left: 0, 
      zIndex: 9999 
    }}>
      <CircularProgress size={60} thickness={4} sx={{ color: '#486730' }} />
    </Box>
  );
}
