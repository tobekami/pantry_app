"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import { auth, provider } from "../../lib/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { Box, Typography } from "@mui/material";
import { FcGoogle } from "react-icons/fc";

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
        backgroundImage: "url('/path-to-your-background-image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: 4,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: "#000", fontWeight: "bold", fontSize: "1.5rem", marginBottom: "30px" }}>
        Please login to view your pantry
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleGoogleLogin}
        sx={{
          fontSize: "1rem",
          padding: "10px 20px",
          borderRadius: "10px",
          textTransform: "none",
          display: "flex",
          gap: "5px",
          alignItems: "center",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          "&:hover": {
            backgroundColor: "#f1f1f1",
          },
        }}
      >
        <FcGoogle className="mr-2 text-2xl" />
        Login with Google
      </Button>
    </Box>
  );
};

export default Login;