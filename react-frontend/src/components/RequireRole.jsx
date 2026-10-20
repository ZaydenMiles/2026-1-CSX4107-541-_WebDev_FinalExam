//src/components/RequireRole.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/useUser.js";

// Hides pages of the other role, the backend still checks every request on its own
export default function RequireRole({ role }) {
  const { user } = useUser();

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
