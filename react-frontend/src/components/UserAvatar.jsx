//src/components/UserAvatar.jsx

import { Avatar } from "@mui/material";
import { avatarColor, initials } from "../utils/visual.js";

export default function UserAvatar({ name, size = 36 }) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: avatarColor(name),
        fontSize: size * 0.4,
        fontWeight: 700,
      }}
    >
      {initials(name)}
    </Avatar>
  );
}
