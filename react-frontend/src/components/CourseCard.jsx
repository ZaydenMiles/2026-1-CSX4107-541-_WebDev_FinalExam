//src/components/CourseCard.jsx

import { Card, CardActionArea, CardContent, Chip, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { formatDays, formatPrice } from "../utils/format.js";
import StatusChip from "./StatusChip.jsx";

// Course summary in the Student course lists, links to the course details
export default function CourseCard({ course }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea
        component={RouterLink}
        to={`/courses/${course.id}`}
        sx={{ height: "100%", display: "flex", alignItems: "stretch" }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <div className="flex items-start justify-between gap-2">
            <Typography variant="h6" component="h2" sx={{ lineHeight: 1.3 }}>
              {course.courseName}
            </Typography>
            <StatusChip status={course.status} />
          </div>
          <Typography variant="body2" color="text.secondary">
            by {course.teacher?.name ?? "Unknown teacher"}
          </Typography>

          <div className="mt-3 flex flex-wrap gap-1">
            {course.topics.map((topic) => (
              <Chip key={topic} label={topic} size="small" />
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <span>{formatDays(course.duration)}</span>
            <span>Price {formatPrice(course.price)}</span>
            <span>
              {course.seatsLeft} of {course.maxStudent} seats left
            </span>
          </div>

          {course.isEnrolled && (
            <Chip label="Enrolled" color="primary" size="small" sx={{ mt: 2 }} />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
