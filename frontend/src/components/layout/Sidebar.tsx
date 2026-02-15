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

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path: string) => {
    navigate(path);
    onMobileClose();
  };

  const drawerContent = (
    <>
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
            onClick={() => handleNavClick(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
