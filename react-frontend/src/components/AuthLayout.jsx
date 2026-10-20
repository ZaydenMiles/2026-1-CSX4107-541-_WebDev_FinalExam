//src/components/AuthLayout.jsx

import HowToRegIcon from "@mui/icons-material/HowToReg";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import SecurityIcon from "@mui/icons-material/Security";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import { Typography } from "@mui/material";
import { BRAND_NAME, BRAND_TAGLINE } from "../utils/constants.js";
import BrandLogo from "./BrandLogo.jsx";

const FEATURES = [
  { icon: ManageSearchIcon, text: "Find courses by name or by teacher" },
  { icon: HowToRegIcon, text: "Enroll in open courses with one click" },
  { icon: SpaceDashboardIcon, text: "Teachers create courses and track who enrolled" },
  { icon: SecurityIcon, text: "Secure sign-in with role-based access" },
];

// Split screen for the login and register pages: brand panel on the left, form on the right
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      <aside
        className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between"
        style={{ backgroundColor: "#0B1020" }}
      >
        <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-indigo-600/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative">
          <BrandLogo light />
        </div>

        <div className="relative max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">{BRAND_TAGLINE}</p>
          <h2 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-tight">
            Learn new skills.
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-sky-300 bg-clip-text text-transparent">
              Teach what you know.
            </span>
          </h2>
          <p className="mt-5 text-lg text-white/70">
            One place for Students to discover and join courses, and for Teachers to run them.
          </p>
          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/85">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Icon fontSize="small" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/45">
          © 2026 {BRAND_NAME} · {BRAND_TAGLINE}
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <BrandLogo />
          </div>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
            {subtitle}
          </Typography>
          {children}
        </div>
      </main>
    </div>
  );
}
