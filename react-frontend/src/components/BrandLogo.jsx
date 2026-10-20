//src/components/BrandLogo.jsx

import SchoolIcon from "@mui/icons-material/School";
import { Link as RouterLink } from "react-router-dom";
import { BRAND_NAME } from "../utils/constants.js";

export default function BrandLogo({ light = false }) {
  return (
    <RouterLink
      to="/"
      className="flex shrink-0 items-center gap-2.5"
      style={{ color: light ? "#FFFFFF" : "#0F172A" }}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg shadow-indigo-500/30"
        style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
      >
        <SchoolIcon fontSize="small" />
      </span>
      <span className="text-lg font-extrabold tracking-tight">{BRAND_NAME}</span>
    </RouterLink>
  );
}
