//src/pages/RegisterPage.jsx

import { Alert, Button, Link, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Navigate, Link as RouterLink } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
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
    <AuthLayout
      title="Create a Student Account"
      subtitle="Teacher accounts are created by the administrator."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert severity="error">{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Username"
            value={form.username}
            onChange={updateField("username")}
            autoComplete="username"
            required
          />
          <TextField
            label="Full Name"
            value={form.name}
            onChange={updateField("name")}
            autoComplete="name"
          />
        </div>
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={updateField("email")}
          helperText="Used to sign in, together with your username"
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
        <Typography variant="caption" color="text.secondary">
          Username: 3-30 characters of letters, numbers, dot, dash or underscore.
        </Typography>
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </Button>
      </form>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
        Already have an account?{" "}
        <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
          Sign in
        </Link>
      </Typography>
    </AuthLayout>
  );
}
