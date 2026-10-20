//src/pages/teacher/TeacherCourseDetailPage.jsx

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import GroupsIcon from "@mui/icons-material/Groups";
import PaymentsIcon from "@mui/icons-material/Payments";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import HeroBanner from "../../components/HeroBanner.jsx";
import LoadingBlock from "../../components/LoadingBlock.jsx";
import SeatsBar from "../../components/SeatsBar.jsx";
import StatCard from "../../components/StatCard.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import UserAvatar from "../../components/UserAvatar.jsx";
import { useUser } from "../../context/useUser.js";
import { formatDateTime, formatDays, formatPrice } from "../../utils/format.js";

export default function TeacherCourseDetailPage() {
  const { courseId } = useParams();
  const { apiFetch } = useUser();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await apiFetch(`/api/course/${courseId}`, { method: "DELETE" });
      navigate("/teacher/courses", { replace: true });
    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  }

  if (isLoading) {
    return <LoadingBlock />;
  }

  if (!course) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <Button component={RouterLink} to="/teacher/courses" startIcon={<ArrowBackIcon />}>
            Back to My Courses
          </Button>
        </div>
        <Alert severity="error">{error || "Course not found"}</Alert>
      </div>
    );
  }

  const hasStudents = course.enrolledCount > 0;

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner>
        <Button
          component={RouterLink}
          to="/teacher/courses"
          startIcon={<ArrowBackIcon />}
          sx={{ color: "rgba(255,255,255,0.75)", mb: 3, ml: -1 }}
        >
          Back to My Courses
        </Button>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <StatusChip status={course.status} />
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{course.courseName}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
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
          <div className="flex gap-2">
            <Button
              component={RouterLink}
              to={`/teacher/courses/${course.id}/edit`}
              variant="contained"
              startIcon={<EditIcon />}
              sx={{ backgroundImage: "none", bgcolor: "#FFFFFF", color: "#0F172A", "&:hover": { bgcolor: "#E2E8F0" } }}
            >
              Edit
            </Button>
            <Tooltip title={hasStudents ? "Courses with enrolled students cannot be deleted" : ""}>
              <span>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  disabled={hasStudents}
                  onClick={() => setIsConfirmOpen(true)}
                  sx={{
                    color: "#FDA4AF",
                    borderColor: "rgba(253,164,175,0.5)",
                    "&.Mui-disabled": { color: "rgba(255,255,255,0.35)", borderColor: "rgba(255,255,255,0.15)" },
                  }}
                >
                  Delete
                </Button>
              </span>
            </Tooltip>
          </div>
        </div>
      </HeroBanner>

      {error && <Alert severity="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ScheduleIcon} label="Duration" value={formatDays(course.duration)} />
        <StatCard icon={PaymentsIcon} label="Price" value={formatPrice(course.price)} color="#059669" />
        <StatCard icon={EventSeatIcon} label="Seats Left" value={course.seatsLeft} hint={`Max Student ${course.maxStudent}`} color="#D97706" />
        <Card>
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Enrollment
            </Typography>
            <SeatsBar enrolled={course.enrolledCount} max={course.maxStudent} />
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Typography variant="h6" component="h2">
            Enrolled Students ({course.students.length})
          </Typography>
        </div>
        {course.students.length === 0 ? (
          <EmptyState
            icon={GroupsIcon}
            title="No students have enrolled yet"
            text="Students who enroll in this course will appear here."
          />
        ) : (
          <Card>
            <TableContainer>
              <Table sx={{ minWidth: 640 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Enrolled At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {course.students.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={student.name || student.username} size={32} />
                          <span className="font-semibold">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell sx={{ color: "text.secondary" }}>{formatDateTime(student.enrolledAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete course?"
        message={`"${course.courseName}" will be removed permanently.`}
        confirmLabel="Delete"
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
