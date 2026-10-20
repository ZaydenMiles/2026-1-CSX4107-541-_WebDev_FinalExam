//src/pages/teacher/CourseFormPage.jsx

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import CourseCard from "../../components/CourseCard.jsx";
import LoadingBlock from "../../components/LoadingBlock.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { useUser } from "../../context/useUser.js";
import { COURSE_STATUSES, STATUS_OPEN } from "../../utils/constants.js";

const EMPTY_FORM = {
  courseName: "",
  duration: "",
  price: "",
  maxStudent: "",
  status: STATUS_OPEN,
  topics: [],
};

const STATUS_HELP = {
  Open: "Visible to Students and open for enrollment",
  Close: "Visible to Students but enrollment is closed",
  Cancel: "Hidden from the Student course list",
};

// Keeps an empty field empty so the backend reports it, instead of turning it into 0
function toNumberOrBlank(value) {
  return value === "" ? "" : Number(value);
}

function FormSection({ title, description, children }) {
  return (
    <section>
      <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      {children}
    </section>
  );
}

// Create a new course, or edit an existing one when the route has a courseId
export default function CourseFormPage() {
  const { courseId } = useParams();
  const isEdit = Boolean(courseId);
  const { user, apiFetch } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [topicInput, setTopicInput] = useState("");
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) {
      return;
    }
    let ignore = false;
    apiFetch(`/api/course/${courseId}`)
      .then((data) => {
        if (ignore) return;
        const course = data.course;
        setForm({
          courseName: course.courseName,
          duration: String(course.duration),
          price: String(course.price),
          maxStudent: String(course.maxStudent),
          status: course.status,
          topics: course.topics,
        });
        setEnrolledCount(course.enrolledCount);
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
  }, [apiFetch, courseId, isEdit]);

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  // Adds the typed topics to the list, "HTML, CSS" adds two topics
  function withTypedTopics(topics) {
    const typed = topicInput
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);
    return [...new Set([...topics, ...typed])];
  }

  function addTopic() {
    setForm((current) => ({ ...current, topics: withTypedTopics(current.topics) }));
    setTopicInput("");
  }

  function removeTopic(topic) {
    setForm((current) => ({
      ...current,
      topics: current.topics.filter((item) => item !== topic),
    }));
  }

  function handleTopicKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTopic();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Include topics that were typed but not added yet
    const topics = withTypedTopics(form.topics);

    const payload = {
      courseName: form.courseName,
      duration: toNumberOrBlank(form.duration),
      price: toNumberOrBlank(form.price),
      maxStudent: toNumberOrBlank(form.maxStudent),
      status: form.status,
      topics: topics,
    };

    setIsSaving(true);
    try {
      const data = isEdit
        ? await apiFetch(`/api/course/${courseId}`, { method: "PATCH", body: payload })
        : await apiFetch("/api/course", { method: "POST", body: payload });
      navigate(`/teacher/courses/${data.course.id}`);
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingBlock />;
  }

  const backLink = isEdit ? `/teacher/courses/${courseId}` : "/teacher/courses";
  const maxStudent = Number(form.maxStudent) || 0;
  const previewCourse = {
    courseName: form.courseName.trim() || "Untitled course",
    topics: withTypedTopics(form.topics),
    duration: Number(form.duration) || 0,
    price: Number(form.price) || 0,
    maxStudent: maxStudent,
    enrolledCount: enrolledCount,
    seatsLeft: Math.max(maxStudent - enrolledCount, 0),
    status: form.status,
    teacher: { name: user.name },
    isEnrolled: false,
  };

  return (
    <>
      <PageHeader
        eyebrow={isEdit ? "Edit course" : "Create course"}
        title={isEdit ? "Edit Course" : "New Course"}
        subtitle={
          isEdit
            ? "Update the details Students see for this course."
            : "Fill in the details and Students can enroll once the course is Open."
        }
        actions={
          <Button component={RouterLink} to={backLink} startIcon={<ArrowBackIcon />}>
            Back
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3, p: { xs: 2.5, sm: 4 } }}>
            {error && <Alert severity="error">{error}</Alert>}

            <FormSection title="Course details" description="The name and visibility of the course.">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
                <TextField
                  label="Course Name"
                  value={form.courseName}
                  onChange={updateField("courseName")}
                  required
                  fullWidth
                />
                <TextField
                  select
                  label="Status"
                  value={form.status}
                  onChange={updateField("status")}
                  helperText={STATUS_HELP[form.status]}
                >
                  {COURSE_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            </FormSection>

            <Divider />

            <FormSection title="Schedule and pricing" description="How long the course runs, its price and how many Students can join.">
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField
                  label="Duration (days)"
                  type="number"
                  value={form.duration}
                  onChange={updateField("duration")}
                  slotProps={{ htmlInput: { min: 1, step: 1 } }}
                  required
                />
                <TextField
                  label="Price"
                  type="number"
                  value={form.price}
                  onChange={updateField("price")}
                  slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                  helperText="0 makes the course free"
                  required
                />
                <TextField
                  label="Max Student"
                  type="number"
                  value={form.maxStudent}
                  onChange={updateField("maxStudent")}
                  slotProps={{ htmlInput: { min: Math.max(1, enrolledCount), step: 1 } }}
                  helperText={isEdit ? `${enrolledCount} students enrolled now` : " "}
                  required
                />
              </div>
            </FormSection>

            <Divider />

            <FormSection title="Topics" description="What Students will learn. Add as many topics as you need.">
              <div className="flex gap-2">
                <TextField
                  label="Add a topic"
                  value={topicInput}
                  onChange={(event) => setTopicInput(event.target.value)}
                  onKeyDown={handleTopicKeyDown}
                  helperText="Press Enter or comma to add each topic"
                  fullWidth
                />
                <Button variant="outlined" onClick={addTopic} sx={{ alignSelf: "flex-start", height: 56 }}>
                  Add
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {form.topics.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No topics yet
                  </Typography>
                ) : (
                  form.topics.map((topic) => (
                    <Chip key={topic} label={topic} color="primary" variant="outlined" onDelete={() => removeTopic(topic)} />
                  ))
                )}
              </div>
            </FormSection>

            <Divider />

            <div className="flex justify-end gap-2">
              <Button component={RouterLink} to={backLink} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" size="large" disabled={isSaving}>
                {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Course"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <aside className="flex flex-col gap-3 lg:sticky lg:top-24">
          <Typography variant="overline" color="text.secondary">
            Live preview
          </Typography>
          <CourseCard course={previewCourse} linkTo={null} />
          <Typography variant="caption" color="text.secondary">
            This is how the course appears to Students.
          </Typography>
        </aside>
      </form>
    </>
  );
}
