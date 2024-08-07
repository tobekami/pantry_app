"use client";

import React, { useState, useEffect } from 'react';
import { firestore, collection, addDoc, doc, updateDoc, deleteDoc } from '../lib/firebaseConfig';
import TextField from '@mui/material/TextField';
import { User } from 'firebase/auth';
import { Box, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckIcon from '@mui/icons-material/Check';
import { PantryItem } from '@/types/pantry';

interface PantryFormProps {
  item?: PantryItem;
  onSubmit: (item: PantryItem) => void;
  onDelete?: (id: string) => void;
  user: User | null;
  isNewItem?: boolean;
}

const PantryForm: React.FC<PantryFormProps> = ({ item, onSubmit, onDelete, user, isNewItem = false }) => {
  const [name, setName] = useState(item ? item.name : '');
  const [quantity, setQuantity] = useState(item ? item.quantity : 1);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
    }
  }, [item]);
  
  const handleSubmit = async () => {
    if (!user || !name) return;

    const newItem: PantryItem = { name, quantity, userId: user.uid };

    try {
      if (item && item.id) {
        const itemRef = doc(firestore, 'pantry', item.id);
        const updateData = {
          name: newItem.name,
          quantity: newItem.quantity,
          userId: newItem.userId
        };
        await updateDoc(itemRef, updateData);
        newItem.id = item.id;
      } else {
        const docRef = await addDoc(collection(firestore, 'pantry'), newItem);
        newItem.id = docRef.id;
      }

      onSubmit(newItem);

      if (isNewItem) {
        setName('');
        setQuantity(1);
      }
    } catch (error) {
      console.error("Error adding/updating document: ", error);
    }
  };

  const handleDelete = () => {
    if (item && item.id && onDelete) {
      onDelete(item.id);
    }
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
    if (!isNewItem) handleSubmit();
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(0, prev - 1));
    if (!isNewItem) handleSubmit();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1}}>
      <TextField
    value={name}
    onChange={(e) => setName(e.target.value)}
    variant="standard"
    placeholder={isNewItem ? "Add new item" : undefined}
    InputProps={{ disableUnderline: !isNewItem }}
    sx={{ mr: 1, flexGrow: 1 }}
    required
  />
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
      <IconButton onClick={handleDecrement} size="small">
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Typography variant="body1" sx={{ mx: 1, minWidth: '20px', textAlign: 'center' }}>
        {quantity}
      </Typography>
      <IconButton onClick={handleIncrement} size="small">
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
    {!isNewItem && onDelete && (
      <IconButton onClick={handleDelete} size="small">
        <DeleteIcon fontSize="small" />
      </IconButton>
    )}
    {isNewItem && (
      <IconButton onClick={handleSubmit} color="primary" size="small">
        <CheckIcon fontSize="small" />
      </IconButton>
    )}
    </Box>
  );
};

export default PantryForm;