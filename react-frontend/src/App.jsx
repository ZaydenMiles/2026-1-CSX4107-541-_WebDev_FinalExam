//src/App.jsx

import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./components/RequireAuth.jsx";
import RequireRole from "./components/RequireRole.jsx";
import { useUser } from "./context/useUser.js";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import MyCoursesPage from "./pages/student/MyCoursesPage.jsx";
import StudentCourseDetailPage from "./pages/student/StudentCourseDetailPage.jsx";
import StudentCourseListPage from "./pages/student/StudentCourseListPage.jsx";
import CourseFormPage from "./pages/teacher/CourseFormPage.jsx";
import TeacherCourseDetailPage from "./pages/teacher/TeacherCourseDetailPage.jsx";
import TeacherCourseListPage from "./pages/teacher/TeacherCourseListPage.jsx";
import theme from "./theme.js";
import { ROLE_STUDENT, ROLE_TEACHER } from "./utils/constants.js";

// Sends each role to its own start page
function HomeRedirect() {
  const { user } = useUser();
  return (
    <Navigate
      to={user.role === ROLE_TEACHER ? "/teacher/courses" : "/courses"}
      replace
    />
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<HomeRedirect />} />

            <Route element={<RequireRole role={ROLE_TEACHER} />}>
              <Route path="/teacher/courses" element={<TeacherCourseListPage />} />
              <Route
                path="/teacher/courses/new"
                element={<CourseFormPage key="new" />}
              />
              <Route
                path="/teacher/courses/:courseId"
                element={<TeacherCourseDetailPage />}
              />
              <Route
                path="/teacher/courses/:courseId/edit"
                element={<CourseFormPage key="edit" />}
              />
            </Route>

            <Route element={<RequireRole role={ROLE_STUDENT} />}>
              <Route path="/courses" element={<StudentCourseListPage />} />
              <Route
                path="/courses/:courseId"
                element={<StudentCourseDetailPage />}
              />
              <Route path="/my-courses" element={<MyCoursesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}
