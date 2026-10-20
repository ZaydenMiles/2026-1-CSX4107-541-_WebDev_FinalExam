//src/pages/LoginPage.jsx

import SchoolIcon from "@mui/icons-material/School";
import { Alert, Button, Card, CardContent, Link, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Navigate, Link as RouterLink, useLocation } from "react-router-dom";
import { useUser } from "../context/useUser.js";

export default function LoginPage() {
  const { user, login } = useUser();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already logged in, go back to the page that asked for a login
  if (user) {
    return <Navigate to={location.state?.from?.pathname ?? "/"} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card variant="outlined" sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <SchoolIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h5" component="h1">
              Online Course Service
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue
            </Typography>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Username or Email"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            No account yet?{" "}
            <Link component={RouterLink} to="/register">
              Register
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
