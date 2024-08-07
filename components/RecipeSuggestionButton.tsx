// components/RecipeSuggestionButton.tsx
import React from 'react';
import { Button } from '@mui/material';
import { PantryItem } from '@/types/pantry';

interface RecipeSuggestionButtonProps {
    onClick: () => void;
  }
  
const RecipeSuggestionButton: React.FC<RecipeSuggestionButtonProps> = ({ onClick }) => {

  return (
    <Button size="small" variant="contained" color="primary" onClick={onClick}>
      Suggest Recipes
    </Button>
  );
};

export default RecipeSuggestionButton;