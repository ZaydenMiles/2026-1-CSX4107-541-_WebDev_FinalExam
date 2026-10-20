//src/pages/teacher/TeacherCourseDetailPage.jsx

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Button,
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
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import CourseInfo from "../../components/CourseInfo.jsx";
import LoadingBlock from "../../components/LoadingBlock.jsx";
import { useUser } from "../../context/useUser.js";
import { formatDateTime } from "../../utils/format.js";

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

  const hasStudents = course?.enrolledCount > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button component={RouterLink} to="/teacher/courses" startIcon={<ArrowBackIcon />}>
          Back to My Courses
        </Button>
        {course && (
          <div className="flex gap-2">
            <Button
              component={RouterLink}
              to={`/teacher/courses/${course.id}/edit`}
              variant="outlined"
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
            <Tooltip title={hasStudents ? "Courses with enrolled students cannot be deleted" : ""}>
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  disabled={hasStudents}
                  onClick={() => setIsConfirmOpen(true)}
                >
                  Delete
                </Button>
              </span>
            </Tooltip>
          </div>
        )}
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      {course && (
        <>
          <CourseInfo course={course} />

          <div>
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
              Enrolled Students ({course.students.length})
            </Typography>
            {course.students.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">No students have enrolled yet.</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table sx={{ minWidth: 560 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Enrolled At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {course.students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.username}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{formatDateTime(student.enrolledAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete course?"
        message={`"${course?.courseName}" will be removed permanently.`}
        confirmLabel="Delete"
        isBusy={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
