"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, Card, CardContent, CardMedia, Button, Container, Modal, IconButton, Chip, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore, auth } from '../lib/firebaseConfig';

interface SavedRecipe {
  id: string;
  recipeId: number;
  title: string;
  image: string;
  instructions: string;
  ingredients: { original: string }[];
  aiStatus?: 'Good' | 'Caution' | 'Avoid' | null;
  aiReason?: string | null;
  aiSwaps?: { from: string; to: string }[];
}

const aiStatusColors = {
  'Good': { bg: '#e8f5e9', text: '#2e7d32', icon: <InfoOutlinedIcon color="success" fontSize="small" /> },
  'Caution': { bg: '#fff8e1', text: '#f57f17', icon: <WarningAmberIcon color="warning" fontSize="small" /> },
  'Avoid': { bg: '#ffebee', text: '#c62828', icon: <ErrorOutlineIcon color="error" fontSize="small" /> },
};

const SavedRecipes: React.FC = () => {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const q = query(collection(firestore, 'saved_recipes'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const recipesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedRecipe));
        setSavedRecipes(recipesList);
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedRecipes();
  }, []);

  const handleRemove = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(firestore, 'saved_recipes', docId));
      setSavedRecipes(prev => prev.filter(r => r.id !== docId));
    } catch (error) {
      console.error("Error removing recipe:", error);
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={60} thickness={4} sx={{ color: '#486730' }} />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ padding: 4 }}>
      {savedRecipes.length === 0 ? (
        <Typography align="center">You have no saved recipes yet.</Typography>
      ) : (
        <List sx={{ padding: 0 }}>
          {savedRecipes.map((recipe) => (
            <ListItem key={recipe.id} disablePadding sx={{ mb: 4 }}>
              <Card sx={{ width: '100%', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, cursor: 'pointer' }} onClick={() => setSelectedRecipe(recipe)}>
                <CardMedia
                  component="img"
                  sx={{ width: { xs: '100%', sm: 200 }, height: { xs: 200, sm: 200 }, objectFit: 'cover' }}
                  image={recipe.image}
                  alt={recipe.title}
                />
                <CardContent sx={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {recipe.title}
                    </Typography>
                    {/* AI badge on card */}
                    {recipe.aiStatus && (
                      <Chip
                        size="small"
                        icon={aiStatusColors[recipe.aiStatus]?.icon}
                        label={recipe.aiStatus === 'Good' ? 'Dietary: Cleared' : `Dietary: ${recipe.aiStatus}`}
                        sx={{
                          mb: 1,
                          bgcolor: aiStatusColors[recipe.aiStatus]?.bg,
                          color: aiStatusColors[recipe.aiStatus]?.text,
                          fontWeight: 600,
                          border: `1px solid ${aiStatusColors[recipe.aiStatus]?.text}`,
                        }}
                      />
                    )}
                  </Box>
                  <Button variant="outlined" color="error" size="small" onClick={(e) => handleRemove(recipe.id, e)} sx={{ alignSelf: 'flex-start' }}>
                    Remove from Saved
                  </Button>
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      )}

      {/* Recipe Detail Modal */}
      <Modal open={!!selectedRecipe} onClose={() => setSelectedRecipe(null)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: 800, bgcolor: 'background.paper', boxShadow: 24, p: 4,
          maxHeight: '90vh', overflow: 'auto', borderRadius: 2
        }}>
          <IconButton onClick={() => setSelectedRecipe(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
          {selectedRecipe && (
            <>
              <Typography variant="h4" component="h2" gutterBottom>
                {selectedRecipe.title}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <CardMedia component="img" sx={{ width: 250, height: 250, borderRadius: '50%', objectFit: 'cover' }} image={selectedRecipe.image} alt={selectedRecipe.title} />
              </Box>

              {/* Saved AI Nutritionist verdict */}
              {selectedRecipe.aiStatus && (
                <Box sx={{ mb: 3, p: 2.5, bgcolor: aiStatusColors[selectedRecipe.aiStatus]?.bg, borderRadius: '12px', border: `1px solid ${aiStatusColors[selectedRecipe.aiStatus]?.text}` }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    {aiStatusColors[selectedRecipe.aiStatus]?.icon}
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: aiStatusColors[selectedRecipe.aiStatus]?.text }}>
                      {selectedRecipe.aiStatus === 'Good' ? 'Dietary: Cleared ✓' : `Dietary: ${selectedRecipe.aiStatus}`}
                    </Typography>
                  </Box>
                  {selectedRecipe.aiReason && (
                    <Typography variant="body2" sx={{ color: '#333', mb: selectedRecipe.aiSwaps && selectedRecipe.aiSwaps.length > 0 ? 1.5 : 0 }}>
                      {selectedRecipe.aiReason}
                    </Typography>
                  )}
                  {selectedRecipe.aiSwaps && selectedRecipe.aiSwaps.length > 0 && (
                    <Box sx={{ p: 1.5, bgcolor: '#f1f8f1', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#2e7d32', mb: 0.5 }}>
                        🔄 Suggested Swaps
                      </Typography>
                      <List dense>
                        {selectedRecipe.aiSwaps.map((swap, i) => (
                          <ListItem key={i} sx={{ py: 0.25, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                            <Box component="span" sx={{ textDecoration: 'line-through', color: '#c62828', fontWeight: 500 }}>
                              {swap.from}
                            </Box>
                            <Box component="span" sx={{ mx: 0.5, color: '#555' }}>→</Box>
                            <Box component="span" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                              {swap.to}
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}

              <Typography variant="h5" gutterBottom>Ingredients:</Typography>
              <List>
                {selectedRecipe.ingredients.map((ing, i) => (
                  <ListItem key={i} sx={{ py: 0.5, borderBottom: '1px solid #eee' }}>• {ing.original}</ListItem>
                ))}
              </List>
              <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>Instructions:</Typography>
              <Typography variant="body1" component="div" dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }} />
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default SavedRecipes;
