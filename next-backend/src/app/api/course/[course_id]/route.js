//src/app/api/course/[course_id]/route.js

import { getRequestUser } from "@/lib/auth";
import {
  COURSE_COLLECTION,
  ROLE_STUDENT,
  ROLE_TEACHER,
  STATUS_CANCEL,
} from "@/lib/constant";
import {
  findCourseWithTeacher,
  findEnrolledStudents,
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

export async function OPTIONS() {
  return optionsResponse();
}

// Loads a course for the Teacher who owns it. Returns { course } or { response } holding the error.
async function findOwnedCourse(db, courseId, user) {
  const course = await db.collection(COURSE_COLLECTION).findOne({ _id: courseId });
  if (!course) {
    return { response: errorResponse("Course not found", 404) };
  }
  if (course.teacherId.toString() !== user.id) {
    return {
      response: errorResponse("You can only manage your own courses", 403),
    };
  }
  return { course: course };
}

/**
 * GET /api/course/:course_id
 *   Teacher: own course only, including the enrolled students
 *   Student: any course that is not cancelled
 */
export async function GET(req, { params }) {
  const user = getRequestUser(req);
  if (!user) {
    return errorResponse("Unauthorized Request", 401);
  }

  const { course_id } = await params;
  const courseId = toObjectId(course_id);
  if (!courseId) {
    return errorResponse("Invalid course id", 400);
  }

  try {
    const db = await getDb();
    const course = await findCourseWithTeacher(db, courseId);
    if (!course) {
      return errorResponse("Course not found", 404);
    }

    if (user.role === ROLE_TEACHER) {
      if (course.teacherId.toString() !== user.id) {
        return errorResponse("You can only view your own courses", 403);
      }
      const students = await findEnrolledStudents(db, course);
      return successResponse(
        { course: { ...toCourseResponse(course, user.id), students: students } },
        200,
      );
    }

    if (user.role === ROLE_STUDENT) {
      if (course.status === STATUS_CANCEL) {
        return errorResponse("Course not found", 404);
      }
      return successResponse({ course: toCourseResponse(course, user.id) }, 200);
    }

    return errorResponse("Forbidden", 403);
  } catch (error) {
    printExceptionLog("GET /api/course/[course_id]", error);
    return errorResponse("Internal Server Error", 500);
  }
}

// PATCH /api/course/:course_id  owning Teacher only, any subset of the course fields
export async function PATCH(req, { params }) {
  const user = getRequestUser(req);
  if (!user) {
    return errorResponse("Unauthorized Request", 401);
  }
  if (user.role !== ROLE_TEACHER) {
    return errorResponse("Only Teachers can update courses", 403);
  }

  const { course_id } = await params;
  const courseId = toObjectId(course_id);
  if (!courseId) {
    return errorResponse("Invalid course id", 400);
  }

  const body = await readJsonBody(req);
  if (!body) {
    return errorResponse("Invalid request body", 400);
  }

  const { data, error } = validateCourse(body, true);
  if (error) {
    return errorResponse(error, 400);
  }

  try {
    const db = await getDb();
    const { course, response } = await findOwnedCourse(db, courseId, user);
    if (response) {
      return response;
    }

    const filter = { _id: courseId, teacherId: course.teacherId };
    if (data.maxStudent !== undefined) {
      // Checked inside the update so a concurrent enrollment cannot slip past it
      filter.$expr = { $lte: [{ $size: "$students" }, data.maxStudent] };
    }

    const result = await db
      .collection(COURSE_COLLECTION)
      .updateOne(filter, { $set: { ...data, updatedAt: new Date() } });

    if (result.matchedCount === 0) {
      return errorResponse(
        `Max Student cannot be lower than the ${course.students.length} students already enrolled`,
        409,
      );
    }

    const updated = await findCourseWithTeacher(db, courseId);
    return successResponse(
      {
        message: "Course updated",
        course: toCourseResponse(updated, user.id),
      },
      200,
    );
  } catch (error) {
    printExceptionLog("PATCH /api/course/[course_id]", error);
    return errorResponse("Internal Server Error", 500);
  }
}

// DELETE /api/course/:course_id  owning Teacher only, and only while no Student is enrolled
export async function DELETE(req, { params }) {
  const user = getRequestUser(req);
  if (!user) {
    return errorResponse("Unauthorized Request", 401);
  }
  if (user.role !== ROLE_TEACHER) {
    return errorResponse("Only Teachers can delete courses", 403);
  }

  const { course_id } = await params;
  const courseId = toObjectId(course_id);
  if (!courseId) {
    return errorResponse("Invalid course id", 400);
  }

  try {
    const db = await getDb();
    const { course, response } = await findOwnedCourse(db, courseId, user);
    if (response) {
      return response;
    }

    // The empty-students condition is part of the delete so an enrollment cannot race it
    const result = await db.collection(COURSE_COLLECTION).deleteOne({
      _id: courseId,
      teacherId: course.teacherId,
      students: { $size: 0 },
    });

    if (result.deletedCount === 0) {
      return errorResponse(
        "Cannot delete a course that has enrolled students",
        409,
      );
    }
    return successResponse({ message: "Course deleted" }, 200);
  } catch (error) {
    printExceptionLog("DELETE /api/course/[course_id]", error);
    return errorResponse("Internal Server Error", 500);
  }
}
