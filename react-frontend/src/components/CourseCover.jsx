//src/components/CourseCover.jsx

import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import BrushIcon from "@mui/icons-material/Brush";
import CodeIcon from "@mui/icons-material/Code";
import DnsIcon from "@mui/icons-material/Dns";
import InsightsIcon from "@mui/icons-material/Insights";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import StorageIcon from "@mui/icons-material/Storage";
import { createElement } from "react";
import { coverGradient } from "../utils/visual.js";

// The first rule matching the course name or topics picks the cover icon
const ICON_RULES = [
  [/mongo|database|sql|data model|index/i, StorageIcon],
  [/python|data analysis|pandas|numpy|visuali/i, InsightsIcon],
  [/mobile|ios|android/i, PhoneIphoneIcon],
  [/ux|design|figma|wirefram|prototyp/i, BrushIcon],
  [/web|html|css|javascript|react|jquery|frontend|hooks/i, CodeIcon],
  [/node|api|rest|jwt|server|backend|middleware/i, DnsIcon],
];

function coverIcon(course, sx) {
  const text = `${course.courseName} ${(course.topics ?? []).join(" ")}`;
  const icon = ICON_RULES.find(([pattern]) => pattern.test(text))?.[1] ?? AutoStoriesIcon;
  return createElement(icon, { sx });
}

// Generated cover art for a course: a gradient picked from its name plus a topic icon
export default function CourseCover({ course, height = 150, iconSize = 52, rounded = 0, children }) {
  const isLarge = iconSize > 30;
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{ height, borderRadius: rounded, background: coverGradient(course.courseName) }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div aria-hidden className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
      <div aria-hidden className="absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />
      {coverIcon(course, {
        position: "absolute",
        right: isLarge ? 18 : "50%",
        bottom: isLarge ? 14 : "50%",
        transform: isLarge ? "rotate(-8deg)" : "translate(50%, 50%)",
        fontSize: iconSize,
        color: "rgba(255,255,255,0.92)",
        filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.18))",
      })}
      {children}
    </div>
  );
}
