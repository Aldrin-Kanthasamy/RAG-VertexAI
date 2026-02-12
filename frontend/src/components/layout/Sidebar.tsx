import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Description as DocumentIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 240;

const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Chat", icon: <ChatIcon />, path: "/chat" },
  { text: "Documents", icon: <DocumentIcon />, path: "/documents" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" noWrap fontWeight="bold">
            RAG Assistant
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

export { DRAWER_WIDTH };
