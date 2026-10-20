//src/app/api/course/route.js

import { getRequestUser } from "@/lib/auth";
import {
  COURSE_COLLECTION,
  ROLE_STUDENT,
  ROLE_TEACHER,
  STATUS_CANCEL,
} from "@/lib/constant";
import {
  coursePipeline,
  findCourseWithTeacher,
  toCourseResponse,
  validateCourse,
} from "@/lib/course";
import { getDb } from "@/lib/mongodb";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  readJsonBody,
  successResponse,
  toObjectId,
} from "@/lib/utils";

const MAX_SEARCH_LENGTH = 100;

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * GET /api/course
 *   Teacher: their own courses
 *   Student: all courses except cancelled ones, or ?enrolled=true for their enrolled courses
 *            (cancelled courses are never shown to Students)
 *   ?q=  filters by part of the course name or the teacher name
 */
export async function GET(req) {
  const user = getRequestUser(req);
  if (!user) {
    return errorResponse("Unauthorized Request", 401);
  }

  const userId = toObjectId(user.id);
  const { searchParams } = req.nextUrl;
  const search = (searchParams.get("q") ?? "").trim().slice(0, MAX_SEARCH_LENGTH);

  let match;
  if (user.role === ROLE_TEACHER) {
    match = { teacherId: userId };
  } else if (user.role === ROLE_STUDENT && searchParams.get("enrolled") === "true") {
    match = { "students.userId": userId, status: { $ne: STATUS_CANCEL } };
  } else if (user.role === ROLE_STUDENT) {
    match = { status: { $ne: STATUS_CANCEL } };
  } else {
    return errorResponse("Forbidden", 403);
  }

  try {
    const db = await getDb();
    const courses = await db
      .collection(COURSE_COLLECTION)
      .aggregate(coursePipeline(match, search))
      .toArray();

    return successResponse(
      { courses: courses.map((course) => toCourseResponse(course, user.id)) },
      200,
    );
  } catch (error) {
    printExceptionLog("GET /api/course", error);
    return errorResponse("Internal Server Error", 500);
  }
}

// POST /api/course  Teacher only  body: { courseName, duration, topics, price, maxStudent, status }
export async function POST(req) {
  const user = getRequestUser(req);
  if (!user) {
    return errorResponse("Unauthorized Request", 401);
  }
  if (user.role !== ROLE_TEACHER) {
    return errorResponse("Only Teachers can create courses", 403);
  }

  const body = await readJsonBody(req);
  if (!body) {
    return errorResponse("Invalid request body", 400);
  }

  const { data, error } = validateCourse(body);
  if (error) {
    return errorResponse(error, 400);
  }

  try {
    const db = await getDb();
    const now = new Date();
    const result = await db.collection(COURSE_COLLECTION).insertOne({
      ...data,
      teacherId: toObjectId(user.id),
      students: [],
      createdAt: now,
      updatedAt: now,
    });

    const course = await findCourseWithTeacher(db, result.insertedId);
    return successResponse(
      {
        message: "Course created",
        course: toCourseResponse(course, user.id),
      },
      201,
    );
  } catch (error) {
    printExceptionLog("POST /api/course", error);
    return errorResponse("Internal Server Error", 500);
  }
}
