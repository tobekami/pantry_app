// components/PantryItemRow.tsx
"use client";

import React from 'react';
import { Box, Typography, IconButton, LinearProgress, Avatar } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { PantryItem } from '@/types/pantry';

interface PantryItemRowProps {
    item: PantryItem;
    onUpdate: (item: PantryItem) => void;
    onDelete: (id: string) => void;
}

// Helper to get image from Spoonacular
const getImageUrl = (name: string) => {
    const formattedName = name.toLowerCase().replace(/\s+/g, '-');
    return `https://spoonacular.com/cdn/ingredients_100x100/${formattedName}.jpg`;
};

// Replace your old getExpiryStatus with this:
const getShelfLifeStatus = (dateAdded?: string) => {
    if (!dateAdded) return { health: 100, color: 'primary.main', label: 'Fresh' };

    const addedTime = new Date(dateAdded).getTime();
    const now = new Date().getTime();

    // Calculate difference in days
    const diffInDays = Math.floor((now - addedTime) / (1000 * 3600 * 24));

    // Assuming a generic 14-day freshness window for the progress bar
    let health = Math.max(0, 100 - (diffInDays * 7));
    let color = 'primary.main';
    let label = `${diffInDays} Days Old`;

    if (diffInDays >= 7 && diffInDays < 10) {
        color = 'warning.main';
        label = `Getting Old (${diffInDays}d)`;
    } else if (diffInDays >= 10) {
        color = 'error.main';
        label = `Check Quality (${diffInDays}d)`;
    }

    return { health, color, label };
};

const PantryItemRow: React.FC<PantryItemRowProps> = ({ item, onUpdate, onDelete }) => {
    const { health, color, label } = getShelfLifeStatus(item.dateAdded);

    const handleIncrement = () => onUpdate({ ...item, quantity: item.quantity + 1 });
    const handleDecrement = () => onUpdate({ ...item, quantity: Math.max(0, item.quantity - 1) });

    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', p: 2,
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: '#F5FAFF' },
            borderBottom: '1px solid #F0F0F0'
        }}>
            {/* 1. Image & Name Column */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 2, gap: 2 }}>
                <Avatar
                    variant="rounded"
                    // Directly use the cached URL from Firestore
                    src={item.imageUrl || undefined}
                    alt={item.name}
                    sx={{
                        width: 56, height: 56,
                        bgcolor: '#E0F0FD', color: '#486730',
                        fontWeight: 800, fontSize: '1.5rem'
                    }}
                >
                    {item.name.charAt(0).toUpperCase()}
                </Avatar>

                <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0E1D26' }}>
                    {item.name}
                </Typography>
            </Box>

            {/* 2. Shelf Life Column (Flex: 1.5) - Hidden on very small screens */}
            <Box sx={{ flex: 1.5, px: 2, display: { xs: 'none', sm: 'block' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color }}>
                        {label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#74796C' }}>
                        {health}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={health}
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: '#E0F0FD',
                        '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 }
                    }}
                />
            </Box>

            {/* 3. Quantity Column (Flex: 1) */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#E9F5FF', borderRadius: '20px', px: 1, py: 0.5 }}>
                    <IconButton onClick={handleDecrement} size="small" sx={{ color: '#486730', p: 0.5 }}>
                        <RemoveIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Typography sx={{ mx: 1.5, minWidth: '16px', textAlign: 'center', fontWeight: 800 }}>
                        {item.quantity}
                    </Typography>
                    <IconButton onClick={handleIncrement} size="small" sx={{ color: '#486730', p: 0.5 }}>
                        <AddIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
            </Box>

            {/* 4. Actions Column */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', ml: 2 }}>
                <IconButton onClick={() => onDelete(item.id!)} size="small" sx={{
                    color: '#74796C',
                    '&:hover': { color: '#BA1A1A', bgcolor: '#FFDAD6' }
                }}>
                    <DeleteOutlineIcon />
                </IconButton>
            </Box>

        </Box>
    );
};

export default PantryItemRow;