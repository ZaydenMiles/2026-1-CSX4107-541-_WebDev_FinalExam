//src/pages/student/StudentCourseListPage.jsx

import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { Alert, InputAdornment, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CourseCard from "../../components/CourseCard.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import HeroBanner from "../../components/HeroBanner.jsx";
import LoadingBlock from "../../components/LoadingBlock.jsx";
import { useUser } from "../../context/useUser.js";

const SEARCH_DELAY_MS = 300;

// All courses except cancelled ones, filtered on the server by course or teacher name
export default function StudentCourseListPage() {
  const { user, apiFetch } = useUser();
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

  const query = search.trim();

  return (
    <div className="flex flex-col gap-8">
      <HeroBanner>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
          Hi {user.name.split(" ")[0]}, explore courses
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Find your next course
        </h1>
        <p className="mt-3 max-w-xl text-white/70">
          Browse courses from our teachers and enroll while seats are open. Search by course name or teacher name.
        </p>
        <div className="mt-8 max-w-2xl">
          <TextField
            placeholder="Search by course name or teacher name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "primary.main" }} />
                  </InputAdornment>
                ),
                sx: {
                  height: 58,
                  borderRadius: 4,
                  fontSize: "1.05rem",
                  boxShadow: "0 18px 40px -18px rgba(0,0,0,0.6)",
                  "& fieldset": { border: "none" },
                },
              },
              htmlInput: { "aria-label": "Search courses" },
            }}
          />
        </div>
      </HeroBanner>

      {error && <Alert severity="error">{error}</Alert>}

      {isLoading ? (
        <LoadingBlock />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Typography variant="h5" component="h2">
              {query ? `Results for "${query}"` : "All courses"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {courses.length} course{courses.length === 1 ? "" : "s"}
            </Typography>
          </div>

          {courses.length === 0 ? (
            <EmptyState
              icon={SearchOffIcon}
              title={query ? `No courses match "${query}"` : "No courses available yet"}
              text={query ? "Try another course name or teacher name." : "Check back soon for new courses."}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
