//src/app/api/user/[user_id]/route.js

import { getRequestUser } from "@/lib/auth";
import { USER_COLLECTION } from "@/lib/constant";
import { getDb } from "@/lib/mongodb";
import { toUserResponse } from "@/lib/user";
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

// GET /api/user/:user_id  a user can only read their own profile
export async function GET(req, { params }) {
  const sessionUser = getRequestUser(req);
  if (!sessionUser) {
    return errorResponse("Unauthorized Request", 401);
  }

  const { user_id } = await params;
  const userId = toObjectId(user_id);
  if (!userId) {
    return errorResponse("Invalid user id", 400);
  }
  if (user_id !== sessionUser.id) {
    return errorResponse("You can only view your own profile", 403);
  }

  try {
    const db = await getDb();
    const user = await db.collection(USER_COLLECTION).findOne({ _id: userId });

    if (!user) {
      return errorResponse("User not found", 404);
    }
    return successResponse({ user: toUserResponse(user) }, 200);
  } catch (error) {
    printExceptionLog("GET /api/user/[user_id]", error);
    return errorResponse("Internal Server Error", 500);
  }
}
