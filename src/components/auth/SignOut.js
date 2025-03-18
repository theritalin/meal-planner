import React from "react";
import { auth } from "../../services/firebase";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      // Çıkış yapıldığında login sayfasına yönlendir
      navigate("/login");
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
    }
  };

  return (
    <Button variant="outlined" color="error" onClick={handleSignOut}>
      Çıkış Yap
    </Button>
  );
};

export default SignOut;
