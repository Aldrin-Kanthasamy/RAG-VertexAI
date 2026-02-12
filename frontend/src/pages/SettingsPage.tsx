import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Divider,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {user?.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>User ID:</strong> {user?.uid}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Button variant="outlined" color="error" onClick={logout}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
