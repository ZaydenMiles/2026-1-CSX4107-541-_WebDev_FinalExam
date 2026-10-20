//src/components/AppLayout.jsx

import LogoutIcon from "@mui/icons-material/Logout";
import { AppBar, Box, Button, Container, Toolbar } from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../context/useUser.js";
import { BRAND_NAME, BRAND_TAGLINE, ROLE_TEACHER } from "../utils/constants.js";
import BrandLogo from "./BrandLogo.jsx";
import UserAvatar from "./UserAvatar.jsx";

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
    <div className="flex min-h-screen flex-col">
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: 68, flexWrap: "wrap", columnGap: 2, py: { xs: 1, md: 0 } }}>
            <BrandLogo />

            <nav className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto pt-2 md:order-none md:mx-0 md:ml-6 md:w-auto md:pt-0">
              {links.map((link) => (
                <Button
                  key={link.to}
                  component={NavLink}
                  to={link.to}
                  end
                  sx={{
                    color: "text.secondary",
                    whiteSpace: "nowrap",
                    borderRadius: 99,
                    px: 2,
                    "&.active": { color: "primary.main", bgcolor: "rgba(79, 70, 229, 0.08)" },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </nav>

            <Box sx={{ flexGrow: 1 }} />

            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} />
              <div className="hidden leading-tight sm:block">
                <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.role}</div>
              </div>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ color: "text.secondary", ml: 0.5 }}
              >
                Logout
              </Button>
            </div>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" component="main" sx={{ flexGrow: 1, py: { xs: 3, sm: 5 } }}>
        <Outlet />
      </Container>

      <footer className="border-t border-slate-200 bg-white">
        <Container maxWidth="lg">
          <div className="flex flex-wrap justify-between gap-2 py-6 text-sm text-slate-500">
            <span>
              © 2026 {BRAND_NAME} · {BRAND_TAGLINE}
            </span>
            <span>CSX4107 Final Exam Project</span>
          </div>
        </Container>
      </footer>
    </div>
  );
}
