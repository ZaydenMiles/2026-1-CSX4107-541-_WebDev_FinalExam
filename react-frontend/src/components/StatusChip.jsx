//src/components/StatusChip.jsx

import { Chip } from "@mui/material";
import { STATUS_CANCEL, STATUS_CLOSE, STATUS_OPEN } from "../utils/constants.js";

const STATUS_STYLES = {
  [STATUS_OPEN]: { color: "#047857", background: "#ECFDF5", dot: "#10B981" },
  [STATUS_CLOSE]: { color: "#B45309", background: "#FFFBEB", dot: "#F59E0B" },
  [STATUS_CANCEL]: { color: "#BE123C", background: "#FFF1F2", dot: "#F43F5E" },
};

export default function StatusChip({ status }) {
  const style = STATUS_STYLES[status] ?? { color: "#334155", background: "#F1F5F9", dot: "#94A3B8" };
  return (
    <Chip
      size="small"
      label={status}
      icon={
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: style.dot }}
        />
      }
      sx={{
        color: style.color,
        bgcolor: style.background,
        border: `1px solid ${style.dot}33`,
        "& .MuiChip-icon": { ml: 1, mr: -0.25 },
      }}
    />
  );
}
