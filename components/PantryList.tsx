"use client";

import React from 'react';
import { PantryItem } from '@/types/pantry';
import Button from '@mui/material/Button';
import PantryForm from './PantryForm';
import { User } from 'firebase/auth';

interface PantryListProps {
  items: PantryItem[];
  onDelete: (id: string) => void;
  onUpdate: (item: PantryItem) => void;
  user: User | null;
}

const PantryList: React.FC<PantryListProps> = ({ items, onDelete, onUpdate, user }) => {
  return (
    <div>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <span>{item.name} - {item.quantity}</span>
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} width={50} />}
            <Button variant="contained" onClick={() => onDelete(item.id!)}>Delete</Button>
            <PantryForm item={item} onSubmit={onUpdate} user={user} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PantryList;
