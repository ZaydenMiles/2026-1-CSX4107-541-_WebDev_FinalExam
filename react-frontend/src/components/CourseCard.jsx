//src/components/CourseCard.jsx

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { Card, CardActionArea, CardContent, Chip, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { formatDays, formatPrice } from "../utils/format.js";
import CourseCover from "./CourseCover.jsx";
import SeatsBar from "./SeatsBar.jsx";
import StatusChip from "./StatusChip.jsx";
import UserAvatar from "./UserAvatar.jsx";

const VISIBLE_TOPICS = 3;

/**
 * Course summary card. Links to the Student course details unless linkTo is null
 * (the live preview on the course form).
 */
export default function CourseCard({ course, linkTo }) {
  const to = linkTo === undefined ? `/courses/${course.id}` : linkTo;
  const teacherName = course.teacher?.name ?? "Unknown teacher";
  const extraTopics = course.topics.length - VISIBLE_TOPICS;

  const content = (
    <>
      <CourseCover course={course} height={150}>
        <div className="absolute left-3 top-3">
          <StatusChip status={course.status} />
        </div>
        {course.isEnrolled && (
          <Chip
            size="small"
            icon={<CheckCircleIcon />}
            label="Enrolled"
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              bgcolor: "rgba(255,255,255,0.95)",
              color: "primary.main",
              "& .MuiChip-icon": { color: "primary.main" },
            }}
          />
        )}
      </CourseCover>

      <CardContent sx={{ display: "flex", flexGrow: 1, flexDirection: "column", gap: 1.5, p: 2.5 }}>
        <Typography variant="h6" component="h2" sx={{ fontSize: "1.1rem", lineHeight: 1.35 }}>
          {course.courseName}
        </Typography>

        <div className="flex items-center gap-2">
          <UserAvatar name={teacherName} size={24} />
          <span className="text-sm text-slate-600">{teacherName}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {course.topics.slice(0, VISIBLE_TOPICS).map((topic) => (
            <Chip key={topic} label={topic} size="small" variant="outlined" />
          ))}
          {extraTopics > 0 && <Chip label={`+${extraTopics}`} size="small" variant="outlined" />}
        </div>

        <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-sm text-slate-500">
              <ScheduleIcon sx={{ fontSize: 16 }} />
              {formatDays(course.duration)}
            </span>
            <span className="text-lg font-extrabold text-slate-900">{formatPrice(course.price)}</span>
          </div>
          <SeatsBar enrolled={course.enrolledCount} max={course.maxStudent} />
        </div>
      </CardContent>
    </>
  );

  return (
    <Card
      sx={{
        height: "100%",
        overflow: "hidden",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        ...(to && {
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 22px 44px -22px rgba(15, 23, 42, 0.45)",
          },
        }),
      }}
    >
      {to ? (
        <CardActionArea
          component={RouterLink}
          to={to}
          sx={{ display: "flex", height: "100%", flexDirection: "column", alignItems: "stretch" }}
        >
          {content}
        </CardActionArea>
      ) : (
        <div className="flex h-full flex-col">{content}</div>
      )}
    </Card>
  );
}
