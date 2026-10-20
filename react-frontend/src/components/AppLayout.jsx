//src/components/AppLayout.jsx

import LogoutIcon from "@mui/icons-material/Logout";
import SchoolIcon from "@mui/icons-material/School";
import { AppBar, Box, Button, Chip, Container, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../context/useUser.js";
import { ROLE_TEACHER } from "../utils/constants.js";

const TEACHER_LINKS = [{ to: "/teacher/courses", label: "My Courses" }];
const STUDENT_LINKS = [
  { to: "/courses", label: "Browse Courses" },
  { to: "/my-courses", label: "My Enrollments" },
];

export default function AppLayout() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const links = user.role === ROLE_TEACHER ? TEACHER_LINKS : STUDENT_LINKS;

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ flexWrap: "wrap", gap: 1, py: 1 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mr: 2,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <SchoolIcon />
            Online Course Service
          </Typography>

          {links.map((link) => (
            <Button
              key={link.to}
              component={NavLink}
              to={link.to}
              end
              color="inherit"
              sx={{ "&.active": { bgcolor: "rgba(255, 255, 255, 0.16)" } }}
            >
              {link.label}
            </Button>
          ))}

          <Box sx={{ flexGrow: 1 }} />

          <Chip
            label={`${user.name} (${user.role})`}
            sx={{ bgcolor: "rgba(255, 255, 255, 0.16)", color: "inherit" }}
          />
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </div>
  );
}
