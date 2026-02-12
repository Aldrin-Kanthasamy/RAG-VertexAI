import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar, { DRAWER_WIDTH } from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
