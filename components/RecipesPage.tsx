// pages/recipes/index.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, collection, firestore, getDocs, query, where } from '../lib/firebaseConfig';
import { PantryItem } from '@/types/pantry';
import RecipeSuggestions from '../components/RecipeSuggestions';
import { useRouter } from 'next/navigation';

const RecipesPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserItems(user.uid);
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

  if (!user) return null;

  return (
    <div>
      <h1>Recipe Suggestions</h1>
      <RecipeSuggestions ingredients={ingredients} />
    </div>
  );
};

export default RecipesPage;