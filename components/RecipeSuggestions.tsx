// components/RecipeSuggestions.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Box, Typography, IconButton, List, ListItem, Card, CardContent, CardMedia, Chip, Container } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


interface RecipeSuggestionsProps {
  ingredients: string[];
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
  instructions: string;
  extendedIngredients: {
    original: string;
  }[];
}

const RecipeSuggestions: React.FC<RecipeSuggestionsProps> = ({ ingredients }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Replace with your actual Spoonacular API key
  const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

  useEffect(() => {
    // Fetch recipe suggestions when ingredients change
    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
          params: {
            ingredients: ingredients.join(','),
            number: 5, // Number of recipes to fetch
            apiKey: API_KEY,
          },
        });
        setRecipes(response.data);
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

  // Handle click on a recipe to fetch full details
  const handleRecipeClick = async (recipeId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
        params: {
          apiKey: API_KEY,
        },
      });
      setSelectedRecipe(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error('Error generating full recipe:', error);
      setError('Failed to generate full recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecipe(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container maxWidth="md" sx={{ padding: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Recipe Suggestions
      </Typography>
      {ingredients.length === 0 ? (
        <Typography>No ingredients found in your pantry. Add some items to get recipe suggestions!</Typography>
      ) : recipes.length === 0 ? (
        <Typography>No recipes found for your ingredients. Try adding more items to your pantry!</Typography>
      ) : (
        <List sx={{ padding: 0 }}>
          {recipes.map((recipe) => (
            <ListItem key={recipe.id} disablePadding sx={{ mb: 4 }}>
              <Card sx={{ width: '100%', display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                <CardMedia
                  component="img"
                  sx={{
                    width: { xs: '100%', sm: 200 },
                    height: { xs: 200, sm: 200 },
                    borderRadius: '50%',
                    padding: 2,
                    objectFit: 'cover',
                  }}
                  image={recipe.image}
                  alt={recipe.title}
                />
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {recipe.title}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Used Ingredients ({recipe.usedIngredientCount}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {recipe.usedIngredients.map((ingredient) => (
                        <Chip key={ingredient.id} label={ingredient.name} color="primary" size="small" />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Missing Ingredients ({recipe.missedIngredientCount}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {recipe.missedIngredients.map((ingredient) => (
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
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="recipe-modal-title"
        aria-describedby="recipe-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxHeight: '90vh',
          overflow: 'auto',
          borderRadius: 2,
        }}>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedRecipe && (
            <>
              <Typography id="recipe-modal-title" variant="h4" component="h2" gutterBottom>
                {selectedRecipe.title}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <CardMedia
                  component="img"
                  sx={{
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                  image={selectedRecipe.image}
                  alt={selectedRecipe.title}
                />
              </Box>
              <Typography variant="h5" gutterBottom>Ingredients:</Typography>
              <List>
                {selectedRecipe.extendedIngredients.map((ingredient, index) => (
                  <ListItem key={index}>{ingredient.original}</ListItem>
                ))}
              </List>
              <Typography variant="h5" gutterBottom>Instructions:</Typography>
              <Typography variant="body1" component="div" dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }} />
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default RecipeSuggestions;