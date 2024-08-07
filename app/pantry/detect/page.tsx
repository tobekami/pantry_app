"use client";

import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import DetectItemForm from '../../../components/DetectItemForm';

const DetectPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Detect and Add Items
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Use your camera to detect and add items to your pantry
          </Typography>
          <Typography variant="body1" paragraph>
            Point your camera at a food item and our AI will try to detect it. Once detected, you can add it to your pantry with just a few clicks.
          </Typography>
          <DetectItemForm />
        </Paper>
      </Box>
    </Container>
  );
};

export default DetectPage;