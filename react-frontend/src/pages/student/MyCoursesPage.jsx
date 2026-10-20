//src/pages/student/MyCoursesPage.jsx

import { Alert, Button, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import CourseCard from "../../components/CourseCard.jsx";
import LoadingBlock from "../../components/LoadingBlock.jsx";
import { useUser } from "../../context/useUser.js";

// Courses the logged-in Student is enrolled in
export default function MyCoursesPage() {
  const { apiFetch } = useUser();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    apiFetch("/api/course?enrolled=true")
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

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Typography variant="h4" component="h1">
          My Enrollments
        </Typography>
        <Typography color="text.secondary">Courses you are enrolled in</Typography>
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      {isLoading ? (
        <LoadingBlock />
      ) : courses.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            You have not enrolled in any course yet.
          </Typography>
          <Button component={RouterLink} to="/courses" variant="contained">
            Browse Courses
          </Button>
        </Paper>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
