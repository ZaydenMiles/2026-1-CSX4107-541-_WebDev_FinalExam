// src/lib/user.js

import { ROLE_STUDENT } from "./constant";

const USERNAME_PATTERN = /^[a-z0-9_.-]{3,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_NAME_LENGTH = 60;

// Shape of a user returned by the API, the password is never included
export function toUserResponse(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Validates a registration request body. Public registration only creates Students,
 * Teacher accounts come from the seed script.
 * Returns { data } with normalized fields, or { error, status } with the first problem found.
 */
export function validateNewUser(body) {
  if (body.role !== undefined && body.role !== ROLE_STUDENT) {
    return {
      error: "Only Student accounts can be registered",
      status: 403,
    };
  }

  const username =
    typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!USERNAME_PATTERN.test(username)) {
    return {
      error:
        "Username must be 3-30 characters of letters, numbers, dot, dash or underscore",
    };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "A valid email is required" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `Name must be at most ${MAX_NAME_LENGTH} characters` };
  }
  return {
    data: {
      username: username,
      email: email,
      name: name || username,
      password: password,
      role: ROLE_STUDENT,
    },
  };
}
