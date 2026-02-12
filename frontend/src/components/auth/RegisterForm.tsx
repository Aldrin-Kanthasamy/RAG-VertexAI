import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
      <Typography variant="h5" component="h1" gutterBottom textAlign="center">
        Create Account
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
          autoFocus
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          required
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 2, mb: 1 }}
        >
          {loading ? "Creating account..." : "Register"}
        </Button>
        <Button fullWidth onClick={onSwitchToLogin} sx={{ mt: 1 }}>
          Already have an account? Sign In
        </Button>
      </Box>
    </Paper>
  );
}
