//src/pages/student/StudentCourseDetailPage.jsx

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import { Alert, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import CourseInfo from "../../components/CourseInfo.jsx";
import LoadingBlock from "../../components/LoadingBlock.jsx";
import { useUser } from "../../context/useUser.js";
import { STATUS_CLOSE } from "../../utils/constants.js";

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

  const blockReason = course ? enrollBlockReason(course) : "";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button component={RouterLink} to="/courses" startIcon={<ArrowBackIcon />}>
          Back to Courses
        </Button>
      </div>

      {notice && <Alert severity="success">{notice}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {course && (
        <>
          <CourseInfo course={course} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="contained"
              size="large"
              startIcon={<HowToRegIcon />}
              disabled={Boolean(blockReason) || isEnrolling}
              onClick={handleEnroll}
            >
              {isEnrolling ? "Enrolling..." : course.isEnrolled ? "Enrolled" : "Enroll"}
            </Button>
            {blockReason && !notice && (
              <Alert severity={course.isEnrolled ? "info" : "warning"} sx={{ flexGrow: 1 }}>
                {blockReason}
              </Alert>
            )}
          </div>
        </>
      )}
    </div>
  );
}
