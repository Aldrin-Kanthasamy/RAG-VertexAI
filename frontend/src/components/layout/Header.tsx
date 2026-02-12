import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { DRAWER_WIDTH } from "./Sidebar";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          RAG Application
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2">{user?.email}</Typography>
          <Tooltip title="Sign out">
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
