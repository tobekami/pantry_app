"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../lib/firebaseConfig";
import { Box, Button, Typography, Paper, Link, IconButton } from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';

const Login: React.FC = () => {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/pantry");
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        // Using your new blurry vegetable background
        backgroundImage: "url('/images/login-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {/* Main Card */}
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 4, md: 6 },
          borderRadius: "24px",
          textAlign: "center",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0px 20px 60px rgba(0,0,0,0.05)",
          backgroundColor: "#FFFFFF",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        {/* Logo Section */}
        <Box sx={{ position: "relative", width: 60, height: 60, mb: 1 }}>
          <Image
            src="/images/logo.png"
            alt="Pantry Logo"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </Box>

        {/* Headlines */}
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A1A1A" }}>
          Welcome Back
        </Typography>

        <Typography variant="body2" sx={{ color: "#636E72", mb: 2, lineHeight: 1.6 }}>
          Manage your pantry and discover recipes.
        </Typography>

        {/* Google Button */}
        <Button
          onClick={handleGoogleLogin}
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: "#4285F4", // Google Blue to match design
            color: "#FFF",
            textTransform: "none",
            borderRadius: "30px", // Pill shape
            padding: "10px 0",
            fontSize: "0.95rem",
            fontWeight: 500,
            boxShadow: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            mb: 3, // Spacing before footer links
            '&:hover': {
              backgroundColor: "#357AE8",
              boxShadow: "0px 4px 12px rgba(66, 133, 244, 0.2)",
            }
          }}
        >
          {/* Using a white circle behind the G icon if strictly following design, 
              but standard G icon works well too */}
          <Box sx={{
            bgcolor: 'white',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FcGoogle size={16} />
          </Box>
          Sign in with Google
        </Button>

        {/* Footer Links */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Link href="#" underline="hover" sx={{ color: "#B2BEC3", fontSize: "0.75rem" }}>
            Privacy Policy
          </Link>
          <Typography variant="caption" sx={{ color: "#B2BEC3" }}>•</Typography>
          <Link href="#" underline="hover" sx={{ color: "#B2BEC3", fontSize: "0.75rem" }}>
            Terms of Service
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;