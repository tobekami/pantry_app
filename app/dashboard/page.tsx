"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Grid,
    Chip,
    TextField,
    MenuItem,
    IconButton,
    Snackbar,
    Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

// Firebase
import { User } from 'firebase/auth';
import { auth, firestore, doc, getDoc, setDoc } from '../../lib/firebaseConfig';

const DIET_OPTIONS = ['None', 'Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Pescatarian', 'Gluten-Free'];
const GOAL_OPTIONS = ['Maintenance', 'Weight Loss', 'Muscle Gain', 'Eat More Veggies'];

const DashboardPage: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Profile State
    const [goal, setGoal] = useState('Maintenance');
    const [diet, setDiet] = useState('None');
    const [allergies, setAllergies] = useState<string[]>([]);
    const [allergyInput, setAllergyInput] = useState('');

    // UI State
    const [saveStatus, setSaveStatus] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchUserProfile(currentUser.uid);
            } else {
                router.push('/login');
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const fetchUserProfile = async (uid: string) => {
        try {
            const userRef = doc(firestore, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data().preferences;
                if (data) {
                    setGoal(data.goal || 'Maintenance');
                    setDiet(data.diet || 'None');
                    setAllergies(data.allergies || []);
                }
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        
        let finalAllergies = [...allergies];
        // Auto-add any unentered text in the input field
        if (allergyInput.trim() !== '') {
            const newInputs = allergyInput.split(',').map(s => s.trim()).filter(s => s !== '');
            newInputs.forEach(input => {
                if (!finalAllergies.includes(input)) {
                    finalAllergies.push(input);
                }
            });
            setAllergies(finalAllergies);
            setAllergyInput('');
        }

        try {
            const userRef = doc(firestore, 'users', user.uid);
            await setDoc(userRef, {
                preferences: { goal, diet, allergies: finalAllergies }
            }, { merge: true });

            setSaveStatus(true);
        } catch (error) {
            console.error("Error saving profile:", error);
        }
    };

    const handleAddAllergy = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && allergyInput.trim() !== '') {
            e.preventDefault();
            const newInputs = allergyInput.split(',').map(s => s.trim()).filter(s => s !== '');
            let finalAllergies = [...allergies];
            newInputs.forEach(input => {
                if (!finalAllergies.includes(input)) {
                    finalAllergies.push(input);
                }
            });
            setAllergies(finalAllergies);
            setAllergyInput('');
        }
    };

    const handleRemoveAllergy = (allergyToRemove: string) => {
        setAllergies(allergies.filter(a => a !== allergyToRemove));
    };

    if (isLoading) return null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5FAFF', pb: 8 }}>

            {/* Frosted Glass Header */}
            <Box sx={{ position: 'sticky', top: 0, zIndex: 50, bgcolor: 'rgba(245, 250, 255, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Container maxWidth="md" sx={{ py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => router.push('/pantry')} sx={{ color: '#486730', bgcolor: '#e9f5ff' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#486730' }}>
                            Kitchen Dashboard
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#5f5e59' }}>
                            Manage your dietary guard and preferences.
                        </Typography>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ pt: 6 }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: '16px', border: '1px solid #e0f0fd' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#0e1d26', mb: 4 }}>
                        Dietary Preferences
                    </Typography>

                    <Grid container spacing={4}>
                        {/* Primary Goal */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#74796c', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Primary Goal
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            >
                                {GOAL_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Standard Diet */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#74796c', mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Followed Diet
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {DIET_OPTIONS.map((option) => (
                                    <Chip
                                        key={option}
                                        label={option}
                                        onClick={() => setDiet(option)}
                                        sx={{
                                            px: 1, py: 2.5, borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem',
                                            bgcolor: diet === option ? '#486730' : '#e9f5ff',
                                            color: diet === option ? '#ffffff' : '#486730',
                                            '&:hover': { bgcolor: diet === option ? '#314e1b' : '#daeaf7' }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        {/* Allergies & Restrictions */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#74796c', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Allergies & Custom Restrictions
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Type an ingredient and press Enter (e.g., Peanuts, Cilantro)"
                                value={allergyInput}
                                onChange={(e) => setAllergyInput(e.target.value)}
                                onKeyDown={handleAddAllergy}
                                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {allergies.map((allergy) => (
                                    <Chip
                                        key={allergy}
                                        label={allergy}
                                        onDelete={() => handleRemoveAllergy(allergy)}
                                        sx={{ bgcolor: '#ffdad6', color: '#93000a', fontWeight: 600, borderRadius: '8px' }}
                                    />
                                ))}
                                {allergies.length === 0 && (
                                    <Typography variant="body2" sx={{ color: '#a19f99', fontStyle: 'italic' }}>
                                        No restrictions added.
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 6, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveProfile}
                            sx={{ px: 4, py: 1.5, borderRadius: '30px', fontWeight: 700, bgcolor: '#486730', '&:hover': { bgcolor: '#314e1b' } }}
                        >
                            Save Preferences
                        </Button>
                    </Box>
                </Paper>
            </Container>

            {/* Success Notification */}
            <Snackbar open={saveStatus} autoHideDuration={3000} onClose={() => setSaveStatus(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: '12px', bgcolor: '#486730' }}>
                    Dietary profile saved successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DashboardPage;