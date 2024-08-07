"use client";

import React, { useState, useRef, useEffect } from 'react';
import { firestore, storage } from '../lib/firebaseConfig';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';

interface PantryItem {
  id?: string;
  name: string;
  quantity: string;
  imageUrl?: string;
}

const DetectItemForm: React.FC = () => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const loadedModel = await cocossd.load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  const onVideoLoad = () => {
    setIsVideoReady(true);
  };

  const detect = async () => {
    if (model && webcamRef.current && canvasRef.current && isVideoReady) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Make sure the video dimensions are set
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          requestAnimationFrame(detect);
          return;
        }

        try {
          const detectedObjects = await model.detect(video);

          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);

          let foodDetected = false;
          detectedObjects.forEach((prediction) => {
            const [x, y, width, height] = prediction.bbox;
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);
            ctx.fillStyle = '#00FFFF';
            ctx.font = '18px Arial';
            ctx.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, x, y > 10 ? y - 5 : 10);

            if (prediction.class.toLowerCase().includes('food')) {
              foodDetected = true;
              setName(prediction.class);
              setQuantity('1'); // Default quantity, adjust as needed
            }
          });

          if (!foodDetected) {
            ctx.fillStyle = 'red';
            ctx.font = '24px Arial';
            ctx.fillText('No food detected', 10, 30);
          }
        } catch (error) {
          console.error('Detection error:', error);
        }
      }
    }
    requestAnimationFrame(detect);
  };

  useEffect(() => {
    if (model && isVideoReady) {
      detect();
    }
  }, [model, isVideoReady]);

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot() || '';
    setImageUrl(imageSrc);
  };

  const handleUpload = async () => {
    const blob = await fetch(imageUrl).then((r) => r.blob());
    const fileRef = storage.ref().child(`images/${name}`);
    await fileRef.put(blob);
    const fileUrl = await fileRef.getDownloadURL();
    return fileUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && quantity) {
      const fileUrl = await handleUpload();
      await firestore.collection('pantry').add({ name, quantity, imageUrl: fileUrl });
      alert('Item added to pantry!');
    } else {
      alert('Please ensure a food item is detected and quantity is set');
    }
  };

  return (
    <div>
      <div style={{ position: 'relative', width: '640px', height: '480px' }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{ position: 'absolute', zIndex: 1, width: '100%', height: '100%' }}
          onLoadedData={onVideoLoad}
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', zIndex: 2, width: '100%', height: '100%' }}
        />
      </div>
      <form onSubmit={handleSubmit}>
        <Button onClick={handleCapture}>Capture Photo</Button>
        {imageUrl && <img src={imageUrl} alt="Captured" style={{ maxWidth: '100%' }} />}
        <TextField
          label="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Add Item
        </Button>
      </form>
    </div>
  );
};

export default DetectItemForm;