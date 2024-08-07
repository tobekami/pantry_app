// components/SearchBar.tsx
import React from 'react';
import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';

export interface SearchBarProps {
  onSearch: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'left' }}>
      <TextField
        size="small"
        variant="outlined"
        label="Search Items"
        onChange={(e) => onSearch(e.target.value.toLowerCase())}
        InputProps={{
          style: { borderRadius: 10 }
        }}
        sx={{ width: '100%', maxWidth: '300px' }}
      />
    </Box>
  );
};

export default SearchBar;
  