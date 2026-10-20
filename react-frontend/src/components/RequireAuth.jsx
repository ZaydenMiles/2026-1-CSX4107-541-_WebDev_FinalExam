//src/components/RequireAuth.jsx

import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/useUser.js";
import AppLayout from "./AppLayout.jsx";
import LoadingBlock from "./LoadingBlock.jsx";

// Only logged-in users get past this route, everyone else goes to the login page
export default function RequireAuth() {
  const { user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return <LoadingBlock fullScreen />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <AppLayout />;
}
