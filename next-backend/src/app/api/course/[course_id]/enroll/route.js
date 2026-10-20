//src/app/api/course/[course_id]/enroll/route.js

import { getRequestUser } from "@/lib/auth";
import {
  COURSE_COLLECTION,
  ROLE_STUDENT,
  STATUS_CANCEL,
  STATUS_OPEN,
} from "@/lib/constant";
import { findCourseWithTeacher, toCourseResponse } from "@/lib/course";
import { getDb } from "@/lib/mongodb";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  successResponse,
  toObjectId,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

// Explains why the enrollment update did not match the course
function enrollmentErrorResponse(course, studentId) {
  // Cancelled courses are hidden from Students, so they look like a missing course
  if (!course || course.status === STATUS_CANCEL) {
    return errorResponse("Course not found", 404);
  }
  if (course.students.some((student) => student.userId.equals(studentId))) {
    return errorResponse("You are already enrolled in this course", 409);
  }
  if (course.status !== STATUS_OPEN) {
    return errorResponse("This course is closed for enrollment", 409);
  }
  return errorResponse("This course is full", 409);
}

// POST /api/course/:course_id/enroll  Student only
export async function POST(req, { params }) {
  const user = getRequestUser(req);
  if (!user) {
    return errorResponse("Unauthorized Request", 401);
  }
  if (user.role !== ROLE_STUDENT) {
    return errorResponse("Only Students can enroll in courses", 403);
  }

  const { course_id } = await params;
  const courseId = toObjectId(course_id);
  if (!courseId) {
    return errorResponse("Invalid course id", 400);
  }
  const studentId = toObjectId(user.id);

  try {
    const db = await getDb();
    const courses = db.collection(COURSE_COLLECTION);

    // All enrollment rules live in one atomic update, so two requests cannot both take the last seat
    const result = await courses.updateOne(
      {
        _id: courseId,
        status: STATUS_OPEN,
        "students.userId": { $ne: studentId },
        $expr: { $lt: [{ $size: "$students" }, "$maxStudent"] },
      },
      { $push: { students: { userId: studentId, enrolledAt: new Date() } } },
    );

    if (result.modifiedCount === 0) {
      const course = await courses.findOne({ _id: courseId });
      return enrollmentErrorResponse(course, studentId);
    }

    const course = await findCourseWithTeacher(db, courseId);
    return successResponse(
      {
        message: "Enrolled successfully",
        course: toCourseResponse(course, user.id),
      },
      201,
    );
  } catch (error) {
    printExceptionLog("POST /api/course/[course_id]/enroll", error);
    return errorResponse("Internal Server Error", 500);
  }
}
