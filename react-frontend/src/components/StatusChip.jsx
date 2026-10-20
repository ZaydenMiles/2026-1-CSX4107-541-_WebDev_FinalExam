//src/components/StatusChip.jsx

import { Chip } from "@mui/material";
import { STATUS_CANCEL, STATUS_CLOSE, STATUS_OPEN } from "../utils/constants.js";

const STATUS_COLORS = {
  [STATUS_OPEN]: "success",
  [STATUS_CLOSE]: "warning",
  [STATUS_CANCEL]: "error",
};

export default function StatusChip({ status }) {
  return (
    <Chip
      label={status}
      color={STATUS_COLORS[status] ?? "default"}
      size="small"
      variant="outlined"
    />
  );
}
