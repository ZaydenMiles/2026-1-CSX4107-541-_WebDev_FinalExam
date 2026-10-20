//src/app/api/auth/login/route.js

import bcrypt from "bcrypt";
import { signJWT, tokenCookieOptions } from "@/lib/auth";
import {
  TOKEN_COOKIE_NAME,
  TOKEN_MAX_AGE_SECONDS,
  USER_COLLECTION,
} from "@/lib/constant";
import { getDb } from "@/lib/mongodb";
import { toUserResponse } from "@/lib/user";
import {
  errorResponse,
  optionsResponse,
  printExceptionLog,
  readJsonBody,
  successResponse,
} from "@/lib/utils";

export async function OPTIONS() {
  return optionsResponse();
}

// POST /api/auth/login  body: { username, password }, username may also be the email
export async function POST(req) {
  const body = await readJsonBody(req);
  const identifier =
    typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!identifier || !password) {
    return errorResponse("Username and password are required", 400);
  }

  try {
    const db = await getDb();
    const user = await db.collection(USER_COLLECTION).findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    // Same message for an unknown user and a wrong password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return errorResponse("Invalid username or password", 401);
    }

    const token = signJWT(user);
    const response = successResponse(
      {
        message: "Login successful",
        user: toUserResponse(user),
        // Also returned in the body for browsers that block the cross-site cookie
        token: token,
      },
      200,
    );
    response.cookies.set(
      TOKEN_COOKIE_NAME,
      token,
      tokenCookieOptions(TOKEN_MAX_AGE_SECONDS),
    );
    return response;
  } catch (error) {
    printExceptionLog("POST /api/auth/login", error);
    return errorResponse("Internal Server Error", 500);
  }
}
