// app/pantry/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import PantryForm from '../../../components/PantryForm';
import PantryList from '../../../components/PantryList';
import { User } from 'firebase/auth';
import { auth, collection, deleteDoc, doc, firestore, getDocs, query, where } from '../../../lib/firebaseConfig';
import { PantryItem } from '@/types/pantry';

const PantryPage: React.FC = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user);
      setUser(user);
      if (user) {
        fetchUserItems(user.uid);
      } else {
        fetchGuestItems();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserItems = async (userId: string) => {
    const pantryQuery = query(collection(firestore, 'pantry'), where('userId', '==', userId));
    const querySnapshot = await getDocs(pantryQuery);
    setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PantryItem)));
  };

  const fetchGuestItems = () => {
    const storedItems = localStorage.getItem('guestPantryItems');
    if (storedItems) {
      console.log(storedItems)
      setItems(JSON.parse(storedItems));
    } else {
      console.log("no stored items")
      setItems([]);
    }
  };

  const handleAddOrUpdateItem = (newItem: PantryItem) => {
    const updatedItems = newItem.id
      ? items.map(item => item.id === newItem.id ? newItem : item)
      : [...items, newItem];
    
    setItems(updatedItems);

    if (!user) {
      localStorage.setItem('guestPantryItems', JSON.stringify(updatedItems));
    }
  };

  const handleDelete = async (id: string) => {
    if (user) {
      await deleteDoc(doc(firestore, 'pantry', id));
    } 
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    if (!user) {
      console.log(updatedItems)
      localStorage.setItem('guestPantryItems', JSON.stringify(updatedItems));
    }
  };

  return (
    <div>
      <h1>Pantry</h1>
      <PantryForm onSubmit={handleAddOrUpdateItem} user={user} />
      <PantryList items={items} onDelete={handleDelete} onUpdate={handleAddOrUpdateItem} user={user} />
    </div>
  );
};

export default PantryPage;
