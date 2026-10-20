//src/components/LoadingBlock.jsx

import { CircularProgress } from "@mui/material";

export default function LoadingBlock({ fullScreen = false }) {
  return (
    <div
      className={`flex items-center justify-center ${fullScreen ? "min-h-screen" : "py-16"}`}
    >
      <CircularProgress />
    </div>
  );
}
