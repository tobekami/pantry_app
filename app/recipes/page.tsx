// pages/recipes/index.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, collection, firestore, getDocs, query, where, doc, getDoc } from '../../lib/firebaseConfig';
import { PantryItem } from '@/types/pantry';
import RecipeSuggestions from '../../components/RecipeSuggestions';
import SavedRecipes from '../../components/SavedRecipes';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Tabs, Tab, Container, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const RecipesPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [preferences, setPreferences] = useState({ diet: '', allergies: [] as string[] });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Start on the Saved Recipes tab if ?tab=saved is in the URL
  const [tabIndex, setTabIndex] = useState(searchParams.get('tab') === 'saved' ? 1 : 0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserItems(currentUser.uid);
        await fetchUserPreferences(currentUser.uid);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUserItems = async (userId: string) => {
    const pantryQuery = query(collection(firestore, 'pantry'), where('userId', '==', userId));
    const querySnapshot = await getDocs(pantryQuery);
    const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
    setIngredients(fetchedItems.map(item => item.name));
  };

  const fetchUserPreferences = async (userId: string) => {
    const userSnap = await getDoc(doc(firestore, 'users', userId));
    if (userSnap.exists()) {
      const data = userSnap.data().preferences;
      if (data) {
        setPreferences({ diet: data.diet || '', allergies: data.allergies || [] });
      }
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5FAFF' }}>
      {/* Frosted Glass Header — matches dashboard & detect style */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 50, bgcolor: 'rgba(245, 250, 255, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Container maxWidth="md" sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => router.push('/pantry')} sx={{ color: '#486730', bgcolor: '#e9f5ff' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#486730' }}>
              Recipe Center
            </Typography>
            <Typography variant="body2" sx={{ color: '#5f5e59' }}>
              Generate recipes from your pantry or browse saved ones.
            </Typography>
          </Box>
        </Container>
        <Container maxWidth="md" sx={{ px: 2 }}>
          <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} textColor="primary" indicatorColor="primary">
            <Tab label="Generate Recipes" />
            <Tab label="Saved Recipes" />
          </Tabs>
        </Container>
      </Box>

      {tabIndex === 0 && (
        <RecipeSuggestions ingredients={ingredients} preferences={preferences} />
      )}
      
      {tabIndex === 1 && (
        <SavedRecipes />
      )}
    </Box>
  );
};

export default RecipesPage;