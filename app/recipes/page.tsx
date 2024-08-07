// pages/recipes/index.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, collection, firestore, getDocs, query, where } from '../../lib/firebaseConfig';
import { PantryItem } from '@/types/pantry';
import RecipeSuggestions from '../../components/RecipeSuggestions';
import { useRouter } from 'next/navigation';

const RecipesPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check user authentication status
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserItems(user.uid);
      } else {
        // Redirect to login if user is not authenticated
        router.push('/login');
      }
    });

    // Cleanup function to unsubscribe from the auth listener
    return () => unsubscribe();
  }, [router]);

  // Fetch user's pantry items
  const fetchUserItems = async (userId: string) => {
    const pantryQuery = query(collection(firestore, 'pantry'), where('userId', '==', userId));
    const querySnapshot = await getDocs(pantryQuery);
    const fetchedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem));
    
    // Extract ingredient names from fetched items
    setIngredients(fetchedItems.map(item => item.name));
  };

  // Don't render anything if user is not authenticated
  if (!user) return null;

  return (
    <div>
      {/* Pass ingredients to RecipeSuggestions component */}
      <RecipeSuggestions ingredients={ingredients} />
    </div>
  );
};

export default RecipesPage;