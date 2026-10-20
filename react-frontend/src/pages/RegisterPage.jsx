//src/pages/RegisterPage.jsx

import { Alert, Button, Card, CardContent, Link, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Navigate, Link as RouterLink } from "react-router-dom";
import { useUser } from "../context/useUser.js";

const EMPTY_FORM = {
  username: "",
  name: "",
  email: "",
  password: "",
};

// Public registration creates Student accounts only
export default function RegisterPage() {
  const { user, apiFetch, login } = useUser();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await apiFetch("/api/user", { method: "POST", body: form });
      // Log straight in with the new account
      await login(form.username, form.password);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card variant="outlined" sx={{ width: "100%", maxWidth: 460 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" sx={{ textAlign: "center" }}>
            Create a Student Account
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, mb: 3, textAlign: "center" }}
          >
            Teacher accounts are created by the administrator.
          </Typography>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Username"
              value={form.username}
              onChange={updateField("username")}
              helperText="3-30 characters: letters, numbers, dot, dash or underscore"
              autoComplete="username"
              required
            />
            <TextField
              label="Full Name"
              value={form.name}
              onChange={updateField("name")}
              autoComplete="name"
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={updateField("email")}
              autoComplete="email"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={updateField("password")}
              helperText="At least 6 characters"
              autoComplete="new-password"
              required
            />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            Already have an account?{" "}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
}
