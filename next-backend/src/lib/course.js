// src/lib/course.js

import {
  COURSE_COLLECTION,
  COURSE_STATUSES,
  STATUS_OPEN,
  USER_COLLECTION,
} from "./constant";

const MAX_COURSE_NAME_LENGTH = 100;
const MAX_TOPIC_LENGTH = 50;
const MAX_TOPICS = 20;

// Number() turns "", null and booleans into 0 or 1, treat them as invalid instead
function toNumber(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }
  return NaN;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validates course fields from a request body.
 * With partial=true (updates) only the fields present in the body are checked.
 * Returns { data } with clean values, or { error } with the first problem found.
 */
export function validateCourse(body, partial = false) {
  const data = {};
  const shouldCheck = (field) => !partial || body[field] !== undefined;

  if (shouldCheck("courseName")) {
    const courseName =
      typeof body.courseName === "string" ? body.courseName.trim() : "";
    if (!courseName) {
      return { error: "Course name is required" };
    }
    if (courseName.length > MAX_COURSE_NAME_LENGTH) {
      return {
        error: `Course name must be at most ${MAX_COURSE_NAME_LENGTH} characters`,
      };
    }
    data.courseName = courseName;
  }

  if (shouldCheck("duration")) {
    const duration = toNumber(body.duration);
    if (!Number.isInteger(duration) || duration < 1) {
      return { error: "Duration must be a whole number of days, at least 1" };
    }
    data.duration = duration;
  }

  if (shouldCheck("topics")) {
    if (!Array.isArray(body.topics)) {
      return { error: "Topics must be a list" };
    }
    const topics = [
      ...new Set(
        body.topics
          .filter((topic) => typeof topic === "string")
          .map((topic) => topic.trim())
          .filter(Boolean),
      ),
    ];
    if (topics.length === 0) {
      return { error: "At least one topic is required" };
    }
    if (topics.length > MAX_TOPICS) {
      return { error: `A course can have at most ${MAX_TOPICS} topics` };
    }
    if (topics.some((topic) => topic.length > MAX_TOPIC_LENGTH)) {
      return {
        error: `Each topic must be at most ${MAX_TOPIC_LENGTH} characters`,
      };
    }
    data.topics = topics;
  }

  if (shouldCheck("price")) {
    const price = toNumber(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return { error: "Price must be a number, 0 or more" };
    }
    data.price = Math.round(price * 100) / 100;
  }

  if (shouldCheck("maxStudent")) {
    const maxStudent = toNumber(body.maxStudent);
    if (!Number.isInteger(maxStudent) || maxStudent < 1) {
      return { error: "Max Student must be a whole number, at least 1" };
    }
    data.maxStudent = maxStudent;
  }

  if (body.status !== undefined) {
    if (!COURSE_STATUSES.includes(body.status)) {
      return { error: "Status must be Open, Close or Cancel" };
    }
    data.status = body.status;
  } else if (!partial) {
    data.status = STATUS_OPEN;
  }

  if (Object.keys(data).length === 0) {
    return { error: "No course fields to update" };
  }
  return { data: data };
}

/**
 * Aggregation that loads courses together with their teacher.
 * search (optional) matches part of the course name or the teacher's name or username.
 */
export function coursePipeline(match, search) {
  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: USER_COLLECTION,
        localField: "teacherId",
        foreignField: "_id",
        as: "teacher",
      },
    },
    { $unwind: { path: "$teacher", preserveNullAndEmptyArrays: true } },
  ];

  if (search) {
    const pattern = { $regex: escapeRegex(search), $options: "i" };
    pipeline.push({
      $match: {
        $or: [
          { courseName: pattern },
          { "teacher.name": pattern },
          { "teacher.username": pattern },
        ],
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });
  return pipeline;
}

export async function findCourseWithTeacher(db, courseId) {
  const [course] = await db
    .collection(COURSE_COLLECTION)
    .aggregate(coursePipeline({ _id: courseId }))
    .toArray();
  return course ?? null;
}

// Shape of a course returned by the API, the student list is never part of it
export function toCourseResponse(course, viewerId) {
  const students = course.students ?? [];
  return {
    id: course._id.toString(),
    courseName: course.courseName,
    duration: course.duration,
    topics: course.topics,
    price: course.price,
    maxStudent: course.maxStudent,
    status: course.status,
    teacher: course.teacher
      ? {
          id: course.teacher._id.toString(),
          username: course.teacher.username,
          name: course.teacher.name,
        }
      : null,
    enrolledCount: students.length,
    seatsLeft: Math.max(course.maxStudent - students.length, 0),
    isEnrolled: students.some(
      (student) => student.userId.toString() === viewerId,
    ),
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

// Enrolled students of a course with their contact details, for the owning Teacher
export async function findEnrolledStudents(db, course) {
  const students = course.students ?? [];
  if (students.length === 0) {
    return [];
  }

  const users = await db
    .collection(USER_COLLECTION)
    .find({ _id: { $in: students.map((student) => student.userId) } })
    .toArray();
  const usersById = new Map(users.map((user) => [user._id.toString(), user]));

  return students.map((student) => {
    const user = usersById.get(student.userId.toString());
    return {
      id: student.userId.toString(),
      username: user?.username ?? "(deleted user)",
      name: user?.name ?? "",
      email: user?.email ?? "",
      enrolledAt: student.enrolledAt,
    };
  });
}
