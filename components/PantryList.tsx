"use client";

import React from 'react';
import { PantryItem } from '@/types/pantry';
import { User } from 'firebase/auth';
import { Box, Typography } from '@mui/material';
import PantryItemRow from './PantryItemRow'; // <-- We are importing the new row here!

interface PantryListProps {
  items: PantryItem[];
  onDelete: (id: string) => void;
  onUpdate: (item: PantryItem) => void;
  user: User | null;
}

const PantryList: React.FC<PantryListProps> = ({ items, onDelete, onUpdate }) => {
  if (items.length === 0) {
    return (
      <Typography sx={{ p: 4, textAlign: 'center', color: '#74796C' }}>
        No items in your pantry yet. Add something above!
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Table Header Row (From your HTML design) */}
      <Box sx={{
        display: 'flex',
        px: 2, py: 2,
        bgcolor: '#f5faff',
        borderBottom: '1px solid #e0f0fd'
      }}>
        <Typography sx={{ flex: 2, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#74796C', letterSpacing: 1 }}>
          Product
        </Typography>
        <Typography sx={{ flex: 1.5, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#74796C', letterSpacing: 1, pl: 2, display: { xs: 'none', sm: 'block' } }}>
          Shelf Life
        </Typography>
        <Typography sx={{ flex: 1, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#74796C', letterSpacing: 1, textAlign: 'center' }}>
          Quantity
        </Typography>
        <Typography sx={{ flex: 0.2, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#74796C', letterSpacing: 1 }}>
          Actions
        </Typography>
      </Box>

      {/* Table Body - Renders the new UI for every item */}
      {items.map((item) => (
        <PantryItemRow
          key={item.id}
          item={item}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
};

export default PantryList;