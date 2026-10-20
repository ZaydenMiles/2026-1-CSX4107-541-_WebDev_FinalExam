//src/components/CourseInfo.jsx

import { Card, CardContent, Chip, Typography } from "@mui/material";
import { formatDays, formatPrice } from "../utils/format.js";
import StatusChip from "./StatusChip.jsx";

// Full details of one course, shared by the Teacher and Student detail pages
export default function CourseInfo({ course }) {
  const details = [
    {
      label: "Teacher",
      value: course.teacher ? `${course.teacher.name} (${course.teacher.username})` : "Unknown",
    },
    { label: "Duration", value: formatDays(course.duration) },
    { label: "Price", value: formatPrice(course.price) },
    { label: "Max Student", value: course.maxStudent },
    { label: "Enrolled", value: course.enrolledCount },
    { label: "Seats Left", value: course.seatsLeft },
  ];

  return (
    <Card variant="outlined">
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <Typography variant="h5" component="h1">
            {course.courseName}
          </Typography>
          <StatusChip status={course.status} />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-sm text-slate-500">{detail.label}</dt>
              <dd className="font-medium">{detail.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <div className="text-sm text-slate-500">Topics</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {course.topics.map((topic) => (
              <Chip key={topic} label={topic} size="small" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
