//src/pages/student/StudentCourseListPage.jsx

import SearchIcon from "@mui/icons-material/Search";
import { Alert, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CourseCard from "../../components/CourseCard.jsx";
import LoadingBlock from "../../components/LoadingBlock.jsx";
import { useUser } from "../../context/useUser.js";

const SEARCH_DELAY_MS = 300;

// All courses except cancelled ones, filtered on the server by course or teacher name
export default function StudentCourseListPage() {
  const { apiFetch } = useUser();
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    // Wait until the user stops typing before asking the server
    const timer = setTimeout(async () => {
      const query = search.trim();
      try {
        const data = await apiFetch(
          query ? `/api/course?q=${encodeURIComponent(query)}` : "/api/course",
        );
        if (!ignore) {
          setCourses(data.courses);
          setError("");
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }, SEARCH_DELAY_MS);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [apiFetch, search]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Typography variant="h4" component="h1">
          Browse Courses
        </Typography>
        <Typography color="text.secondary">Find a course and enroll</Typography>
      </div>

      <TextField
        placeholder="Search by course name or teacher name"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
          htmlInput: { "aria-label": "Search courses" },
        }}
        fullWidth
      />

      {error && <Alert severity="error">{error}</Alert>}

      {isLoading ? (
        <LoadingBlock />
      ) : courses.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
          <Typography color="text.secondary">
            {search.trim() ? `No courses match "${search.trim()}".` : "No courses available yet."}
          </Typography>
        </Paper>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary">
            {courses.length} course{courses.length === 1 ? "" : "s"}
          </Typography>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
