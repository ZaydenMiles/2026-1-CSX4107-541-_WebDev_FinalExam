//src/pages/teacher/CourseFormPage.jsx

import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import LoadingBlock from "../../components/LoadingBlock.jsx";
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

// Create a new course, or edit an existing one when the route has a courseId
export default function CourseFormPage() {
  const { courseId } = useParams();
  const isEdit = Boolean(courseId);
  const { apiFetch } = useUser();
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

  return (
    <Card variant="outlined" sx={{ maxWidth: 760, mx: "auto" }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
          {isEdit ? "Edit Course" : "New Course"}
        </Typography>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Course Name"
            value={form.courseName}
            onChange={updateField("courseName")}
            required
            fullWidth
          />

          <div className="grid gap-4 sm:grid-cols-2">
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

          <div>
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
            <div className="mt-2 flex flex-wrap gap-1">
              {form.topics.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No topics yet
                </Typography>
              ) : (
                form.topics.map((topic) => (
                  <Chip key={topic} label={topic} onDelete={() => removeTopic(topic)} />
                ))
              )}
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button
              component={RouterLink}
              to={isEdit ? `/teacher/courses/${courseId}` : "/teacher/courses"}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Create Course"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
