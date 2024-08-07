// page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import PantryForm from '../../components/PantryForm';
import SearchBar from '../../components/SearchBar';
import RecipeSuggestionButton from '../../components/RecipeSuggestionButton';
import { User } from 'firebase/auth';
import { addDoc, auth, collection, deleteDoc, doc, firestore, onSnapshot, query, updateDoc, where } from '../../lib/firebaseConfig';
import { PantryItem } from '@/types/pantry';
import { useRouter } from 'next/navigation';
import { Typography, Box, Container, Grid, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt'

const PantryPage: React.FC = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PantryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        const q = query(collection(firestore, 'pantry'), where('userId', '==', user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const fetchedItems: PantryItem[] = [];
          querySnapshot.forEach((doc) => {
            fetchedItems.push({ id: doc.id, ...doc.data() } as PantryItem);
          });
          setItems(fetchedItems);
          setFilteredItems(fetchedItems);
        });
        return () => unsubscribeSnapshot();
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAddOrUpdateItem = (newItem: PantryItem) => {
    if (user) {
      if (newItem.id) {
        const itemRef = doc(firestore, 'pantry', newItem.id);
        const { id, ...updateData } = newItem; // Remove the 'id' field from the update data
        updateDoc(itemRef, updateData);
      } else {
        const { id, ...addData } = newItem; // Remove the 'id' field if it exists
        addDoc(collection(firestore, 'pantry'), addData);
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (user) {
      await deleteDoc(doc(firestore, 'pantry', id));
      // The local state will be updated automatically by the onSnapshot listener
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const handleSuggestRecipes = () => {
    router.push('/recipes');
  };
  const handleDetectItem = () => {
    router.push('/pantry/detect');
  };

  return (
    <Container maxWidth="sm" sx={{ padding: 2, position: 'relative' }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        My Pantry
      </Typography>
      <Grid container width="100%" alignItems="center" sx={{ mb: 4 }}>
        <Grid item xs>
          <SearchBar onSearch={handleSearch} />
        </Grid>
        <Grid item>
          <RecipeSuggestionButton onClick={handleSuggestRecipes} />
        </Grid>
        <Grid item>
          <IconButton onClick={handleDetectItem} color="primary" aria-label="detect item">
            <CameraAltIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Box sx={{ mb: 4 }}>
        <PantryForm onSubmit={handleAddOrUpdateItem} user={user} isNewItem />
      </Box>
      <Box>
        {filteredItems.map(item => (
          <Box key={item.id} sx={{ mb: 2 }}>
            <PantryForm
              item={item}
              onSubmit={handleAddOrUpdateItem}
              onDelete={handleDeleteItem}
              user={user}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default PantryPage;