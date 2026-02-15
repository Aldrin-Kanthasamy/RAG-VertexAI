import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useAuth } from "../../hooks/useAuth";
import { DRAWER_WIDTH } from "./Sidebar";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          RAG Application
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography
            variant="body2"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {user?.email}
          </Typography>
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
