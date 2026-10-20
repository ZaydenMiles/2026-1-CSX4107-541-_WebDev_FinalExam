//src/pages/student/MyCoursesPage.jsx

import ExploreIcon from "@mui/icons-material/Explore";
import SchoolIcon from "@mui/icons-material/School";
import { Alert, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import CourseCard from "../../components/CourseCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import LoadingBlock from "../../components/LoadingBlock.jsx";
import PageHeader from "../../components/PageHeader.jsx";
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
    <div className="flex flex-col">
      <PageHeader
        eyebrow="My learning"
        title="My Enrollments"
        subtitle="Courses you are enrolled in"
        actions={
          <Button component={RouterLink} to="/courses" variant="outlined" startIcon={<ExploreIcon />}>
            Browse Courses
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {isLoading ? (
        <LoadingBlock />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={SchoolIcon}
          title="You have not enrolled in any course yet"
          text="Find a course you like and enroll while seats are open."
          action={
            <Button component={RouterLink} to="/courses" variant="contained">
              Browse Courses
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
