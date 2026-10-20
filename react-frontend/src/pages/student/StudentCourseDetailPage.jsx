//src/pages/student/StudentCourseDetailPage.jsx

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import GroupsIcon from "@mui/icons-material/Groups";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import PaymentsIcon from "@mui/icons-material/Payments";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { Alert, Button, Card, CardContent, Chip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import CourseCover from "../../components/CourseCover.jsx";
import HeroBanner from "../../components/HeroBanner.jsx";
import LoadingBlock from "../../components/LoadingBlock.jsx";
import SeatsBar from "../../components/SeatsBar.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import UserAvatar from "../../components/UserAvatar.jsx";
import { useUser } from "../../context/useUser.js";
import { STATUS_CLOSE } from "../../utils/constants.js";
import { formatDays, formatPrice } from "../../utils/format.js";

// Why the Enroll button is disabled, or "" when the Student can enroll
function enrollBlockReason(course) {
  if (course.isEnrolled) return "You are enrolled in this course.";
  if (course.status === STATUS_CLOSE) return "This course is closed for enrollment.";
  if (course.seatsLeft === 0) return "This course is full.";
  return "";
}

export default function StudentCourseDetailPage() {
  const { courseId } = useParams();
  const { apiFetch } = useUser();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let ignore = false;
    apiFetch(`/api/course/${courseId}`)
      .then((data) => {
        if (!ignore) setCourse(data.course);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [apiFetch, courseId]);

  async function handleEnroll() {
    setIsEnrolling(true);
    setError("");
    setNotice("");
    try {
      const data = await apiFetch(`/api/course/${courseId}/enroll`, { method: "POST" });
      setCourse(data.course);
      setNotice("You are now enrolled in this course.");
    } catch (err) {
      setError(err.message);
      // Seats or status may have changed since the page loaded
      apiFetch(`/api/course/${courseId}`)
        .then((data) => setCourse(data.course))
        .catch(() => {});
    } finally {
      setIsEnrolling(false);
    }
  }

  if (isLoading) {
    return <LoadingBlock />;
  }

  const backButton = (onDark) => (
    <Button
      component={RouterLink}
      to="/courses"
      startIcon={<ArrowBackIcon />}
      sx={onDark ? { color: "rgba(255,255,255,0.75)", mb: 3, ml: -1 } : undefined}
    >
      Back to Courses
    </Button>
  );

  if (!course) {
    return (
      <div className="flex flex-col gap-4">
        <div>{backButton(false)}</div>
        <Alert severity="error">{error || "Course not found"}</Alert>
      </div>
    );
  }

  const blockReason = enrollBlockReason(course);
  const teacherName = course.teacher?.name ?? "Unknown teacher";
  const facts = [
    { icon: ScheduleIcon, label: "Duration", value: formatDays(course.duration) },
    { icon: PaymentsIcon, label: "Price", value: formatPrice(course.price) },
    { icon: GroupsIcon, label: "Max Student", value: course.maxStudent },
    { icon: HowToRegIcon, label: "Enrolled", value: course.enrolledCount },
    { icon: EventSeatIcon, label: "Seats Left", value: course.seatsLeft },
  ];

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner className="lg:pb-16">
        {backButton(true)}
        <div className="max-w-2xl lg:max-w-[calc(100%-400px)]">
          <StatusChip status={course.status} />
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{course.courseName}</h1>
          <div className="mt-4 flex items-center gap-3">
            <UserAvatar name={teacherName} size={36} />
            <div className="leading-tight">
              <div className="text-xs text-white/60">Taught by</div>
              <div className="font-semibold">
                {teacherName} <span className="font-normal text-white/60">({course.teacher?.username})</span>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {course.topics.map((topic) => (
              <Chip
                key={topic}
                label={topic}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.18)" }}
              />
            ))}
          </div>
        </div>
      </HeroBanner>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          {notice && <Alert severity="success">{notice}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                What you will learn
              </Typography>
              <ul className="grid gap-3 sm:grid-cols-2">
                {course.topics.map((topic) => (
                  <li key={topic} className="flex items-start gap-2.5 text-slate-700">
                    <CheckCircleIcon sx={{ color: "success.main", fontSize: 20, mt: "2px" }} />
                    {topic}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Course details
              </Typography>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon fontSize="small" />
                    </span>
                    <div>
                      <dt className="text-xs text-slate-500">{label}</dt>
                      <dd className="font-bold text-slate-900">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>

        <aside className="relative lg:sticky lg:top-24 lg:-mt-40">
          <Card sx={{ overflow: "hidden", boxShadow: "0 30px 60px -30px rgba(15, 23, 42, 0.45)" }}>
            <CourseCover course={course} height={150} />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, p: 3 }}>
              <div>
                <Typography variant="caption" color="text.secondary">
                  Price
                </Typography>
                <Typography variant="h4" component="p">
                  {formatPrice(course.price)}
                </Typography>
              </div>
              <SeatsBar enrolled={course.enrolledCount} max={course.maxStudent} />
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<HowToRegIcon />}
                disabled={Boolean(blockReason) || isEnrolling}
                onClick={handleEnroll}
              >
                {isEnrolling ? "Enrolling..." : course.isEnrolled ? "Enrolled" : "Enroll"}
              </Button>
              {blockReason && !notice && (
                <Alert severity={course.isEnrolled ? "info" : "warning"}>{blockReason}</Alert>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
                {formatDays(course.duration)} course by {teacherName}
              </Typography>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
