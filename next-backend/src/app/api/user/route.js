//src/app/api/user/route.js

import bcrypt from "bcrypt";
import { getRequestUser } from "@/lib/auth";
import { USER_COLLECTION } from "@/lib/constant";
import { getDb } from "@/lib/mongodb";
import { toUserResponse, validateNewUser } from "@/lib/user";
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

// GET /api/user  returns the logged-in user, used by the frontend to restore a session
export async function GET(req) {
  const sessionUser = getRequestUser(req);
  if (!sessionUser) {
    return errorResponse("Unauthorized Request", 401);
  }

  try {
    const db = await getDb();
    const user = await db
      .collection(USER_COLLECTION)
      .findOne({ _id: toObjectId(sessionUser.id) });

    if (!user) {
      return errorResponse("User not found", 404);
    }
    return successResponse({ user: toUserResponse(user) }, 200);
  } catch (error) {
    printExceptionLog("GET /api/user", error);
    return errorResponse("Internal Server Error", 500);
  }
}

// POST /api/user  registers a new Student  body: { username, name, email, password }
export async function POST(req) {
  const body = await readJsonBody(req);
  if (!body) {
    return errorResponse("Invalid request body", 400);
  }

  const { data, error, status } = validateNewUser(body);
  if (error) {
    return errorResponse(error, status ?? 400);
  }

  try {
    const db = await getDb();
    const users = db.collection(USER_COLLECTION);

    const existing = await users.findOne({
      $or: [{ username: data.username }, { email: data.email }],
    });
    if (existing) {
      return errorResponse("Username or email is already taken", 409);
    }

    const now = new Date();
    const newUser = {
      ...data,
      password: await bcrypt.hash(data.password, 10),
      createdAt: now,
      updatedAt: now,
    };
    const result = await users.insertOne(newUser);

    return successResponse(
      {
        message: "User registered",
        user: toUserResponse({ ...newUser, _id: result.insertedId }),
      },
      201,
    );
  } catch (error) {
    // Unique index violation when two registrations race
    if (error?.code === 11000) {
      return errorResponse("Username or email is already taken", 409);
    }
    printExceptionLog("POST /api/user", error);
    return errorResponse("Internal Server Error", 500);
  }
}
