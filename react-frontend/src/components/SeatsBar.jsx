//src/components/SeatsBar.jsx

import { LinearProgress } from "@mui/material";

// Enrolled seats out of Max Student, turning amber when almost full and red when full
export default function SeatsBar({ enrolled, max }) {
  const percent = max > 0 ? Math.min(100, Math.round((enrolled / max) * 100)) : 0;
  const color = percent >= 100 ? "error" : percent >= 75 ? "warning" : "primary";
  const seatsLeft = Math.max(max - enrolled, 0);

  return (
    <div>
      <div className="mb-1.5 flex justify-between gap-3 whitespace-nowrap text-xs font-medium text-slate-500">
        <span>
          {enrolled} / {max} enrolled
        </span>
        <span className={seatsLeft === 0 ? "text-rose-600" : ""}>
          {seatsLeft === 0 ? "Full" : `${seatsLeft} seats left`}
        </span>
      </div>
      <LinearProgress variant="determinate" value={percent} color={color} />
    </div>
  );
}
