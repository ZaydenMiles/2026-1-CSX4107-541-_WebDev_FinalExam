//src/pages/teacher/TeacherCourseListPage.jsx

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import EditIcon from "@mui/icons-material/EditOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
  Button,
  Card,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import CourseCover from "../../components/CourseCover.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import LoadingBlock from "../../components/LoadingBlock.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import SeatsBar from "../../components/SeatsBar.jsx";
import StatCard from "../../components/StatCard.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import { useUser } from "../../context/useUser.js";
import { STATUS_CANCEL, STATUS_CLOSE, STATUS_OPEN } from "../../utils/constants.js";
import { formatDays, formatPrice } from "../../utils/format.js";

// Dashboard numbers for the Teacher's own courses
function summarize(courses) {
  const count = (status) => courses.filter((course) => course.status === status).length;
  const active = courses.filter((course) => course.status !== STATUS_CANCEL);
  const seatsTaken = active.reduce((sum, course) => sum + course.enrolledCount, 0);
  const seatsTotal = active.reduce((sum, course) => sum + course.maxStudent, 0);
  return {
    open: count(STATUS_OPEN),
    closed: count(STATUS_CLOSE),
    cancelled: count(STATUS_CANCEL),
    students: courses.reduce((sum, course) => sum + course.enrolledCount, 0),
    seatsTaken,
    seatsTotal,
    fillRate: seatsTotal > 0 ? Math.round((seatsTaken / seatsTotal) * 100) : 0,
  };
}

export default function TeacherCourseListPage() {
  const { user, apiFetch } = useUser();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    apiFetch("/api/course")
      .then((data) => {
        if (!ignore) setCourses(data.courses);
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
  }, [apiFetch]);

  const stats = useMemo(() => summarize(courses), [courses]);

  async function handleDelete() {
    const deleted = courseToDelete;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/course/${deleted.id}`, { method: "DELETE" });
      setCourses((current) => current.filter((course) => course.id !== deleted.id));
      setNotice(`"${deleted.courseName}" was deleted.`);
      setError("");
    } catch (err) {
      setError(err.message);
      setNotice("");
    } finally {
      setIsDeleting(false);
      setCourseToDelete(null);
    }
  }

  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Teacher dashboard"
        title={`Welcome back, ${firstName}`}
        subtitle="Manage your courses and see who has enrolled."
        actions={
          <Button
            component={RouterLink}
            to="/teacher/courses/new"
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
          >
            New Course
          </Button>
        }
      />

      {notice && (
        <Alert severity="success" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {isLoading ? (
        <LoadingBlock />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={LibraryBooksIcon}
              label="Courses"
              value={courses.length}
              hint={`${stats.open} open for enrollment`}
            />
            <StatCard
              icon={GroupsIcon}
              label="Students enrolled"
              value={stats.students}
              hint="Across all your courses"
              color="#0EA5E9"
            />
            <StatCard
              icon={LockOpenIcon}
              label="Open courses"
              value={stats.open}
              hint={`${stats.closed} closed, ${stats.cancelled} cancelled`}
              color="#059669"
            />
            <StatCard
              icon={DonutLargeIcon}
              label="Seats filled"
              value={`${stats.fillRate}%`}
              hint={`${stats.seatsTaken} of ${stats.seatsTotal} seats`}
              color="#D97706"
            />
          </div>

          {courses.length === 0 ? (
            <EmptyState
              icon={LibraryBooksIcon}
              title="You have no courses yet"
              text="Create your first course and Students can start enrolling."
              action={
                <Button component={RouterLink} to="/teacher/courses/new" variant="contained" startIcon={<AddIcon />}>
                  New Course
                </Button>
              }
            />
          ) : (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                <Typography variant="h6" component="h2">
                  My Courses
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {courses.length} course{courses.length === 1 ? "" : "s"}
                </Typography>
              </div>
              <TableContainer>
                <Table sx={{ minWidth: 820 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Course</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell sx={{ width: 220 }}>Enrollment</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map((course) => {
                      const hasStudents = course.enrolledCount > 0;
                      return (
                        <TableRow key={course.id} hover>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-14 shrink-0 overflow-hidden rounded-xl">
                                <CourseCover course={course} height={44} iconSize={22} />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  component={RouterLink}
                                  to={`/teacher/courses/${course.id}`}
                                  underline="hover"
                                  sx={{ fontWeight: 700, color: "text.primary" }}
                                >
                                  {course.courseName}
                                </Link>
                                <div className="truncate text-xs text-slate-500">
                                  {course.topics.join(" · ")}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusChip status={course.status} />
                          </TableCell>
                          <TableCell>{formatDays(course.duration)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>
                            {formatPrice(course.price)}
                          </TableCell>
                          <TableCell>
                            <SeatsBar enrolled={course.enrolledCount} max={course.maxStudent} />
                          </TableCell>
                          <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                            <Tooltip title="View details">
                              <IconButton
                                component={RouterLink}
                                to={`/teacher/courses/${course.id}`}
                                aria-label={`View ${course.courseName}`}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                component={RouterLink}
                                to={`/teacher/courses/${course.id}/edit`}
                                aria-label={`Edit ${course.courseName}`}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={hasStudents ? "Courses with enrolled students cannot be deleted" : "Delete"}
                            >
                              <span>
                                <IconButton
                                  color="error"
                                  disabled={hasStudents}
                                  onClick={() => setCourseToDelete(course)}
                                  aria-label={`Delete ${course.courseName}`}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(courseToDelete)}
        title="Delete course?"
        message={`"${courseToDelete?.courseName}" will be removed permanently.`}
        confirmLabel="Delete"
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setCourseToDelete(null)}
      />
    </div>
  );
}
