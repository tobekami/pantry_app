import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Box, Typography, IconButton, List, ListItem, Card, CardContent, CardMedia, Chip, Container, Snackbar, Alert, CircularProgress, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../lib/firebaseConfig';

interface RecipeSuggestionsProps {
  ingredients: string[];
  preferences: {
    goal?: string;
    diet: string;
    allergies: string[];
  };
}

interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

interface Recipe {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  usedIngredients: Ingredient[];
  missedIngredients: Ingredient[];
}

interface FullRecipe extends Recipe {
  id: number;
  title: string;
  image: string;
  instructions: string;
  extendedIngredients: {
    original: string;
  }[];
}

interface AIAnalysis {
  status: 'Good' | 'Caution' | 'Avoid';
  reason: string;
  swaps?: { from: string; to: string }[];
}

const RecipeSuggestions: React.FC<RecipeSuggestionsProps> = ({ ingredients, preferences }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showModified, setShowModified] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (msg: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Create a unique fingerprint of the current pantry state
        const cacheKey = `recipes_${[...ingredients].sort().join(',')}`;
        const cachedData = sessionStorage.getItem(cacheKey);

        if (cachedData) {
          // Instant load if pantry hasn't changed
          setRecipes(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        }

        // Otherwise hit Spoonacular
        const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
          params: {
            ingredients: ingredients.join(','),
            number: 8,
            apiKey: API_KEY,
          }
        });

        const fetchedRecipes = response.data || [];
        setRecipes(fetchedRecipes);

        // Save the result for future visits linking exactly to this pantry state
        if (fetchedRecipes.length > 0) {
          sessionStorage.setItem(cacheKey, JSON.stringify(fetchedRecipes));
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setError('Failed to fetch recipes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (ingredients.length > 0) {
      fetchRecipes();
    }
  }, [ingredients, API_KEY]);

  const handleRecipeClick = async (recipeId: number) => {
    setIsLoading(true);
    setError(null);
    setAiAnalysis(null);
    setShowModified(false);
    try {
      const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
        params: { apiKey: API_KEY },
      });
      const recipeData = response.data;
      setSelectedRecipe(recipeData);
      setModalOpen(true);

      const currentUser = auth.currentUser;
      if (currentUser) {
        const q = query(
          collection(firestore, 'saved_recipes'),
          where('userId', '==', currentUser.uid),
          where('recipeId', '==', recipeId)
        );
        const snapshot = await getDocs(q);
        setIsSaved(!snapshot.empty);
      } else {
        setIsSaved(false);
      }

      // Begin AI Analysis in parallel — don't block modal
      setIsAnalyzing(true);
      const aiRes = await fetch('/api/analyze-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeTitle: recipeData.title,
          ingredients: recipeData.extendedIngredients,
          preferences: preferences
        })
      });

      if (aiRes.ok) {
        const analysisData = await aiRes.json();
        setAiAnalysis(analysisData);
      }
    } catch (error) {
      console.error('Error handling recipe check:', error);
      setError('Failed to load recipe details.');
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const handleSaveRecipe = async () => {
    // Re-read currentUser at call time to avoid stale closure
    const currentUser = auth.currentUser;
    if (!selectedRecipe) { showToast('No recipe selected.', 'error'); return; }
    if (!currentUser) { showToast('You must be logged in to save recipes.', 'error'); return; }

    try {
      // Dedup check
      const q = query(
        collection(firestore, 'saved_recipes'),
        where('userId', '==', currentUser.uid),
        where('recipeId', '==', selectedRecipe.id)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        showToast('Recipe already saved!', 'info');
        return;
      }

      // Safely map ingredients — guard against undefined
      const ingredientsList = (selectedRecipe.extendedIngredients || [])
        .filter(ing => ing && ing.original)
        .map(ing => ({ original: ing.original }));

      await addDoc(collection(firestore, 'saved_recipes'), {
        userId: currentUser.uid,
        recipeId: selectedRecipe.id,
        title: selectedRecipe.title || '',
        image: selectedRecipe.image || '',
        instructions: selectedRecipe.instructions || 'No instructions provided.',
        ingredients: ingredientsList,
        // Persist the AI nutritionist verdict alongside the recipe
        aiStatus: aiAnalysis?.status || null,
        aiReason: aiAnalysis?.reason || null,
        aiSwaps: aiAnalysis?.swaps || [],
      });

      setIsSaved(true);
      showToast('Recipe saved successfully!', 'success');
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      showToast(`Failed to save: ${error?.message || 'unknown error'}`, 'error');
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecipe(null);
    setAiAnalysis(null);
    setShowModified(false);
  };

  const aiStatusColors = {
    'Good': { bg: '#e8f5e9', text: '#2e7d32', icon: <InfoOutlinedIcon color="success" /> },
    'Caution': { bg: '#fff8e1', text: '#f57f17', icon: <WarningAmberIcon color="warning" /> },
    'Avoid': { bg: '#ffebee', text: '#c62828', icon: <ErrorOutlineIcon color="error" /> },
  };

  if (isLoading && !modalOpen) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="md" sx={{ padding: 4 }}>
      {ingredients.length === 0 ? (
        <Typography>No ingredients found in your pantry. Add some items to get recipe suggestions!</Typography>
      ) : recipes.length === 0 && !isLoading ? (
        <Typography>No recipes found for your pantry items.</Typography>
      ) : (
        <List sx={{ padding: 0 }}>
          {recipes.map((recipe) => (
            <ListItem key={recipe.id} disablePadding sx={{ mb: 4 }}>
              <Card sx={{ width: '100%', display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                <CardMedia
                  component="img"
                  sx={{ width: { xs: '100%', sm: 200 }, height: { xs: 200, sm: 200 }, borderRadius: '50%', padding: 2, objectFit: 'cover' }}
                  image={recipe.image}
                  alt={recipe.title}
                />
                <CardContent sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {recipe.title}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Used Ingredients ({recipe.usedIngredientCount || 0}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {recipe.usedIngredients?.map((ingredient) => (
                        <Chip key={ingredient.id} label={ingredient.name} color="primary" size="small" />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Missing Ingredients ({recipe.missedIngredientCount || 0}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {recipe.missedIngredients?.map((ingredient) => (
                        <Chip key={ingredient.id} label={ingredient.name} color="secondary" size="small" />
                      ))}
                    </Box>
                  </Box>
                  <Button variant="contained" onClick={() => handleRecipeClick(recipe.id)}>
                    View Full Recipe
                  </Button>
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      )}

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: 800, bgcolor: 'background.paper', boxShadow: 24, p: 4, maxHeight: '90vh', overflow: 'auto', borderRadius: 2
        }}>
          <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>

          {selectedRecipe && (
            <>
              <Typography id="recipe-modal-title" variant="h4" component="h2" gutterBottom>
                {selectedRecipe.title}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <CardMedia component="img" sx={{ width: 250, height: 250, borderRadius: '50%', objectFit: 'cover' }} image={selectedRecipe.image} alt={selectedRecipe.title} />
              </Box>

              {/* Smart Health Card */}
              <Box sx={{ mb: 3 }}>
                {isAnalyzing ? (
                  <Box sx={{ p: 3, bgcolor: '#f5faff', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={24} />
                    <Typography>AI Nutritionist is reviewing this recipe...</Typography>
                  </Box>
                ) : aiAnalysis ? (
                  <Box sx={{ p: 3, bgcolor: aiStatusColors[aiAnalysis.status]?.bg, borderRadius: '12px', border: `1px solid ${aiStatusColors[aiAnalysis.status]?.text}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {aiStatusColors[aiAnalysis.status]?.icon}
                      <Typography variant="h6" sx={{ color: aiStatusColors[aiAnalysis.status]?.text, fontWeight: 700 }}>
                        {aiAnalysis.status === 'Good' ? 'Dietary Match: Cleared ✓' : `Dietary Match: ${aiAnalysis.status}`}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#333' }}>
                      {aiAnalysis.reason}
                    </Typography>

                    {/* The Fixer — shows AI swap pairs inline */}
                    {(aiAnalysis.status === 'Caution' || aiAnalysis.status === 'Avoid') && aiAnalysis.swaps && aiAnalysis.swaps.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<AutoFixHighIcon />}
                          onClick={() => setShowModified(!showModified)}
                          sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        >
                          {showModified ? 'Hide' : 'Show'} Diet-Friendly Swaps
                        </Button>

                        {showModified && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#f1f8f1', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#2e7d32', mb: 1 }}>
                              🔄 Suggested Swaps
                            </Typography>
                            <List dense>
                              {aiAnalysis.swaps.map((swap, i) => (
                                <ListItem key={i} sx={{ py: 0.5, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                  <Box component="span" sx={{ textDecoration: 'line-through', color: '#c62828', fontWeight: 500 }}>
                                    {swap.from}
                                  </Box>
                                  <Box component="span" sx={{ mx: 1, color: '#555' }}>→</Box>
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
                  </Box>
                ) : null}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant={isSaved ? "contained" : "outlined"}
                  color="primary"
                  startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  onClick={handleSaveRecipe}
                  disabled={isSaved}
                >
                  {isSaved ? "Saved" : "Save Recipe"}
                </Button>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="h5" gutterBottom>Ingredients:</Typography>
              <List>
                {(selectedRecipe.extendedIngredients || []).map((ingredient, index) => (
                  <ListItem key={index} sx={{ py: 0.5, borderBottom: '1px solid #eee' }}>• {ingredient.original}</ListItem>
                ))}
              </List>

              <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>Instructions:</Typography>
              <Typography variant="body1" component="div" dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions || 'No instructions available.' }} />
            </>
          )}
        </Box>
      </Modal>

      <Snackbar open={toastOpen} autoHideDuration={3000} onClose={() => setToastOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RecipeSuggestions;