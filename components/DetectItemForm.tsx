"use client";

import React, { useState, useRef } from 'react';
import { firestore, auth } from '../lib/firebaseConfig';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Webcam from 'react-webcam';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import Image from 'next/image';
import { CircularProgress, Box, Typography, Card, CardContent, Grid, IconButton, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface DetectedItem {
  name: string;
  quantity: string;
  expiry?: string;
}

const DetectItemForm: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');
  const webcamRef = useRef<Webcam>(null);

  const showToast = (message: string, severity: 'success' | 'error') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleToastClose = () => setToastOpen(false);

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot() || '';
    setImageUrl(imageSrc);
  };

  const handleRetake = () => {
    setImageUrl('');
    setDetectedItems([]);
  };

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    setLoading(true);
    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageUrl }),
      });

      const data = await response.json();
      if (data.items) {
        setDetectedItems(data.items);
      } else {
        showToast(data.error || 'Failed to detect items', 'error');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      showToast('Error analyzing image.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: keyof DetectedItem, value: string) => {
    const updatedItems = [...detectedItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setDetectedItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...detectedItems];
    updatedItems.splice(index, 1);
    setDetectedItems(updatedItems);
  };

  const fetchUnsplashImage = async (itemName: string): Promise<string> => {
    try {
      const query = encodeURIComponent(`${itemName} food ingredient`);
      const apiKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&client_id=${apiKey}&per_page=1`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.thumb;
        }
      }
      return '';
    } catch (error) {
      console.error("Unsplash API Error:", error);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (detectedItems.length === 0) {
      showToast('No items to submit!', 'error');
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      showToast('You must be logged in to save items.', 'error');
      return;
    }

    setLoading(true);
    try {
      for (const item of detectedItems) {
        if (item.name && item.quantity) {
          const addedQty = Number(item.quantity) || 1;
          
          // 1. Check if we already have this item in the DB
          const q = query(
            collection(firestore, 'pantry'),
            where('userId', '==', userId),
            where('name', '==', item.name)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Item exists, just increment the quantity
            const existingDoc = querySnapshot.docs[0];
            const currentQty = Number(existingDoc.data().quantity) || 0;
            await updateDoc(doc(firestore, 'pantry', existingDoc.id), { quantity: currentQty + addedQty });
          } else {
            // Item does not exist, fetch image and create it
            const unsplashUrl = await fetchUnsplashImage(item.name);
            await addDoc(collection(firestore, 'pantry'), {
              name: item.name,
              quantity: addedQty,
              expiry: item.expiry || '',
              imageUrl: unsplashUrl,
              userId: userId,
              dateAdded: new Date().toISOString()
            });
          }
        }
      }
      showToast('Items added to pantry successfully!', 'success');
      handleRetake();
    } catch (error) {
      console.error('Error saving items:', error);
      showToast('Failed to save items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Snackbar open={toastOpen} autoHideDuration={4000} onClose={handleToastClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleToastClose} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>

      {!imageUrl ? (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ width: '100%', borderRadius: '8px' }}
          />
          <Button variant="contained" color="primary" onClick={handleCapture} sx={{ mt: 2 }}>
            Capture Photo
          </Button>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Image src={imageUrl} alt="Captured" style={{ maxWidth: '100%', borderRadius: '8px' }} width={640} height={480} />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="outlined" onClick={handleRetake} disabled={loading}>
              Retake
            </Button>
            {detectedItems.length === 0 && (
              <Button variant="contained" color="secondary" onClick={handleAnalyze} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Analyze with AI'}
              </Button>
            )}
          </Box>
        </Box>
      )}

      {loading && detectedItems.length > 0 && (
         <Box sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Box>
      )}

      {detectedItems.length > 0 && !loading && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Confirm Detected Items</Typography>
          {detectedItems.map((item, index) => (
            <Card key={index} sx={{ mb: 2, p: 2 }}>
              <CardContent sx={{ pb: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Item Name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Expiry (Approx)"
                      value={item.expiry || ''}
                      onChange={(e) => handleItemChange(index, 'expiry', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={1} sx={{ textAlign: 'center' }}>
                    <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outlined" onClick={() => setDetectedItems([...detectedItems, { name: '', quantity: '1', expiry: '' }])} sx={{ mr: 2 }}>
            Add Custom Item
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save All to Pantry
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DetectItemForm;