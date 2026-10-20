//src/pages/teacher/TeacherCourseListPage.jsx

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Alert,
  Button,
  IconButton,
  Link,
  Paper,
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
import { Link as RouterLink } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import LoadingBlock from "../../components/LoadingBlock.jsx";
import StatusChip from "../../components/StatusChip.jsx";
import { useUser } from "../../context/useUser.js";
import { formatDays, formatPrice } from "../../utils/format.js";

export default function TeacherCourseListPage() {
  const { apiFetch } = useUser();
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h4" component="h1">
            My Courses
          </Typography>
          <Typography color="text.secondary">Courses you teach</Typography>
        </div>
        <Button
          component={RouterLink}
          to="/teacher/courses/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          New Course
        </Button>
      </div>

      {notice && (
        <Alert severity="success" onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {isLoading ? (
        <LoadingBlock />
      ) : courses.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
          <Typography color="text.secondary">
            You have no courses yet. Create your first one.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Enrolled</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => {
                const hasStudents = course.enrolledCount > 0;
                return (
                  <TableRow key={course.id} hover>
                    <TableCell>
                      <Link
                        component={RouterLink}
                        to={`/teacher/courses/${course.id}`}
                        underline="hover"
                        sx={{ fontWeight: 500 }}
                      >
                        {course.courseName}
                      </Link>
                      <Typography variant="body2" color="text.secondary">
                        {course.topics.join(", ")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={course.status} />
                    </TableCell>
                    <TableCell>{formatDays(course.duration)}</TableCell>
                    <TableCell align="right">{formatPrice(course.price)}</TableCell>
                    <TableCell align="center">
                      {course.enrolledCount} / {course.maxStudent}
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
                        title={
                          hasStudents
                            ? "Courses with enrolled students cannot be deleted"
                            : "Delete"
                        }
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
