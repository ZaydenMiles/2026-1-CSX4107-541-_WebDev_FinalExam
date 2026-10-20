//src/pages/LoginPage.jsx

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Alert, Button, Divider, Link, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Navigate, Link as RouterLink, useLocation } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import { useUser } from "../context/useUser.js";

// Seeded test accounts, one click fills the form (see README for all accounts)
const DEMO_ACCOUNTS = [
  { label: "Teacher demo", username: "teacher1" },
  { label: "Student demo", username: "student3" },
];
const DEMO_PASSWORD = "password123";

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

  function fillDemo(account) {
    setUsername(account.username);
    setPassword(DEMO_PASSWORD);
    setError("");
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your courses.">
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
        <Button
          type="submit"
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <Divider sx={{ my: 3, color: "text.secondary", fontSize: 13 }}>Try a demo account</Divider>
      <div className="grid grid-cols-2 gap-3">
        {DEMO_ACCOUNTS.map((account) => (
          <Button key={account.username} variant="outlined" onClick={() => fillDemo(account)}>
            {account.label}
          </Button>
        ))}
      </div>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
        New here?{" "}
        <Link component={RouterLink} to="/register" sx={{ fontWeight: 600 }}>
          Register
        </Link>{" "}
        for a Student account
      </Typography>
    </AuthLayout>
  );
}
