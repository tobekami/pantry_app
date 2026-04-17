// app/pantry/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Paper,
  Button,
  Grid,
  InputBase
} from '@mui/material';

// Icons
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Badge from '@mui/material/Badge';

// Firebase & Types
import { User, signOut } from 'firebase/auth';
import { auth, collection, deleteDoc, doc, firestore, onSnapshot, query, updateDoc, addDoc, where, getDocs } from '../../lib/firebaseConfig';
import { PantryItem } from '@/types/pantry';

// Components
import PantryList from '../../components/PantryList';
import PantryForm from '../../components/PantryForm';

const PantryPage: React.FC = () => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PantryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();

  // Helper function to fetch a thumbnail from Unsplash
  const fetchUnsplashImage = async (itemName: string): Promise<string> => {
    try {
      // Append context to improve search accuracy for obscure items
      const query = encodeURIComponent(`${itemName} food ingredient`);
      const apiKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

      // Attempt the fetch call
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&client_id=${apiKey}&per_page=1`
      );

      if (response.ok) {
        const data = await response.json();
        // Return the thumb URL if a result exists, otherwise return an empty string
        if (data.results && data.results.length > 0) {
          return data.results[0].urls.thumb;
        }
      }
      return '';
    } catch (error) {
      console.error("Unsplash API Error:", error);
      return ''; // Fail gracefully so the app doesn't crash
    }
  };

  // Auth & Data Fetching
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        const q = query(collection(firestore, 'pantry'), where('userId', '==', user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const fetchedItems: PantryItem[] = [];
          querySnapshot.forEach((doc) => {
            fetchedItems.push({ id: doc.id, ...doc.data() } as PantryItem);
          });
          setItems(fetchedItems);
          setFilteredItems(fetchedItems);
        });
        return () => unsubscribeSnapshot();
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const alerts: string[] = [];

    items.forEach(item => {
      // Check for low stock
      if (item.quantity < 3) {
        alerts.push(`${item.name} is running low (${item.quantity} left).`);
      }

      // Check for old items (e.g., older than 7 days)
      if (item.dateAdded) {
        const addedTime = new Date(item.dateAdded).getTime();
        const diffInDays = Math.floor((new Date().getTime() - addedTime) / (1000 * 3600 * 24));
        if (diffInDays >= 7) {
          alerts.push(`${item.name} has been sitting for ${diffInDays} days.`);
        }
      }
    });

    setNotifications(alerts);
  }, [items]);


  // Triggers when the bell icon is clicked
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  // Triggers when clicking outside the menu or selecting an item
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleAddOrUpdateItem = async (newItem: PantryItem) => {
    if (!user) return;

    try {
      if (newItem.id) {
        // It's an existing item being updated (e.g., quantity change)
        const itemRef = doc(firestore, 'pantry', newItem.id);
        const { id, ...updateData } = newItem;
        await updateDoc(itemRef, updateData);

      } else {
        // It's a completely new item
        // 1. Check if we already have this item in the DB
        const q = query(
          collection(firestore, 'pantry'),
          where('userId', '==', user.uid),
          where('name', '==', newItem.name)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Item exists, just increment the quantity
          const existingDoc = querySnapshot.docs[0];
          const newQuantity = (existingDoc.data().quantity || 0) + newItem.quantity;
          await updateDoc(doc(firestore, 'pantry', existingDoc.id), { quantity: newQuantity });

        } else {
          // Item does not exist, we need to create it
          // 2. Resolve the image URL before saving
          let finalImageUrl = newItem.imageUrl || '';

          // If the camera didn't provide an image, fetch one from Unsplash
          if (!finalImageUrl) {
            finalImageUrl = await fetchUnsplashImage(newItem.name);
          }

          // 3. Prepare the final data payload
          const { id, ...addData } = newItem;
          addData.dateAdded = new Date().toISOString(); // From our previous shelf-life setup
          addData.imageUrl = finalImageUrl; // Attach the permanently cached URL

          // 4. Save to Firestore
          await addDoc(collection(firestore, 'pantry'), addData);
        }
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (user) await deleteDoc(doc(firestore, 'pantry', id));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredItems(items.filter(item => item.name.toLowerCase().includes(term)));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        // Dynamically set the background image based on inventory state
        backgroundImage: filteredItems.length === 0
          ? 'url("/images/empty-crate-bg.png")'
          : 'url("/images/fruits-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed', // Keeps the image stable while scrolling
        position: 'relative',
        overflowX: 'hidden',
        // We add a subtle overlay to ensure your UI elements remain legible 
        // against the potentially busy fruit background
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: filteredItems.length === 0
            ? 'rgba(245, 250, 255, 0.7)' // Lighter overlay for the empty crate
            : 'rgba(255, 255, 255, 0.85)', // Stronger overlay for the fruits
          zIndex: -1,
        }
      }}
    >

      {/* Organic Background Blobs */}
      <Box sx={{ position: 'fixed', top: '-10%', right: '-10%', width: 500, height: 500, bgcolor: '#87a96b', filter: 'blur(60px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }} />
      <Box sx={{ position: 'fixed', bottom: '-10%', left: '-10%', width: 400, height: 400, bgcolor: '#d0e5d2', filter: 'blur(60px)', opacity: 0.15, borderRadius: '50%', zIndex: 0 }} />

      {/* 1. Frosted Glass Header */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 50,
        bgcolor: 'rgba(245, 250, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <Container maxWidth="lg" sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#486730', letterSpacing: '-0.5px' }}>
              Pantry Dashboard
            </Typography>
            <Typography variant="body2" fontWeight={500} sx={{ color: '#5f5e59' }}>
              Curating your kitchen&apos;s natural ecosystem.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notifications Trigger */}
            <Box>
              <IconButton
                onClick={handleNotificationMenuOpen}
                sx={{ color: '#5f5e59', '&:hover': { bgcolor: 'rgba(135, 169, 107, 0.1)' } }}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>

              {/* Notifications Dropdown Menu */}
              <Menu
                anchorEl={notificationAnchorEl}
                open={Boolean(notificationAnchorEl)}
                onClose={handleNotificationMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.08))', // Adds depth
                    mt: 1.5,
                    minWidth: 300,
                    maxWidth: 360,
                    borderRadius: '16px',
                    border: '1px solid rgba(135, 169, 107, 0.1)',
                    bgcolor: '#ffffff'
                  }
                }}
              >
                {/* Handle Empty State */}
                {notifications.length === 0 ? (
                  <MenuItem sx={{ py: 3, justifyContent: 'center', pointerEvents: 'none' }}>
                    <Typography variant="body2" sx={{ color: '#74796c', fontWeight: 600 }}>
                      Your pantry is fully stocked and fresh!
                    </Typography>
                  </MenuItem>
                ) : (
                  /* Map through active notifications */
                  notifications.map((note, index) => (
                    <MenuItem
                      key={index}
                      onClick={handleNotificationMenuClose}
                      sx={{
                        py: 2,
                        px: 3,
                        borderBottom: index !== notifications.length - 1 ? '1px solid #f5faff' : 'none',
                        whiteSpace: 'normal', // Allows text to wrap instead of truncating
                        transition: 'background-color 0.2s',
                        '&:hover': { bgcolor: '#fbfdfc' }
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#0e1d26', fontWeight: 500, lineHeight: 1.5 }}>
                        {note}
                      </Typography>
                    </MenuItem>
                  ))
                )}
              </Menu>
            </Box>
            <Box>
              <IconButton onClick={handleProfileMenuOpen} size="small" sx={{ p: 0, border: '2px solid rgba(135, 169, 107, 0.2)' }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: '#486730', color: 'white' }}>
                  {user?.email?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                onClick={handleProfileMenuClose}
                PaperProps={{ elevation: 0, sx: { overflow: 'visible', filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))', mt: 1.5 } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => router.push('/dashboard')}>
                  <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Dashboard</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => router.push('/recipes?tab=saved')}>
                  <ListItemIcon><BookmarkIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Saved Recipes</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="lg" sx={{ pt: 6, pb: 12, position: 'relative', zIndex: 1 }}>

        {/* 2. Search & Actions Bar */}
        <Grid container spacing={1} alignItems="center" sx={{ mb: 6, flexWrap: 'nowrap' }}>
          {/* Search Input - Takes up remaining space */}
          <Grid item xs sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ position: 'relative', width: '100%' }}>
              <SearchIcon sx={{ position: 'absolute', zIndex: 10, left: 16, top: '50%', transform: 'translateY(-50%)', color: '#74796c' }} />
              <InputBase
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                fullWidth
                sx={{
                  width: '100%',
                  pl: 6, pr: 2, py: 1.5,
                  bgcolor: '#daeaf7', borderRadius: '30px', color: '#0e1d26',
                  transition: 'all 0.2s',
                  '&.Mui-focused': { bgcolor: '#ffffff', boxShadow: '0 0 0 2px #486730' }
                }}
              />
            </Box>
          </Grid>

          {/* Action Buttons - Stays inline */}
          <Grid item sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button
              variant="contained"
              onClick={() => router.push('/recipes')}
              sx={{
                borderRadius: '30px',
                // Logic: On mobile (xs), make it a circle/square. On desktop (md), restore padding.
                minWidth: { xs: '48px', md: 'auto' },
                px: { xs: 0, md: 4 },
                py: 1.5,
                fontWeight: 700,
                background: 'linear-gradient(to right, #486730, #87a96b)',
                color: '#ffffff',
                '&:hover': { opacity: 0.9 }
              }}
            >
              <AutoAwesomeIcon sx={{ mr: { xs: 0, md: 1 } }} />
              {/* This Box hides the text on mobile and shows it starting at the 'md' breakpoint */}
              <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                Suggest Recipes
              </Box>
            </Button>

            <IconButton
              onClick={() => router.push('/pantry/detect')}
              sx={{
                bgcolor: '#e9f5ff', color: '#486730', p: 1.5,
                borderRadius: '30px', // Matches the theme of the other buttons
                '&:hover': { bgcolor: '#daeaf7' }
              }}
            >
              <CameraAltIcon />
            </IconButton>
          </Grid>
        </Grid>

        {/* 3. The Editorial Table */}
        <Paper elevation={0} sx={{ borderRadius: '16px', bgcolor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>

          {/* Add Item Row (using the same styling container) */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e9f5ff', bgcolor: '#fbfdfc' }}>
            <PantryForm onSubmit={handleAddOrUpdateItem} user={user} isNewItem />
          </Box>

          <PantryList
            items={filteredItems}
            onDelete={handleDeleteItem}
            onUpdate={handleAddOrUpdateItem}
            user={user}
          />
        </Paper>

      </Container>
    </Box>
  );
};

export default PantryPage;