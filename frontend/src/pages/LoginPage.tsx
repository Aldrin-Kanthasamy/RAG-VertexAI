import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: "#f5f5f5" }}
    >
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </Box>
  );
}
