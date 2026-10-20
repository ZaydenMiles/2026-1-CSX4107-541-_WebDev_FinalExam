import jwt from "jsonwebtoken";
import {
  TOKEN_COOKIE_NAME,
  TOKEN_MAX_AGE_SECONDS,
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
  X_HEADER_USER_ROLE,
} from "./constant";

const JWT_SECRET = process.env.JWT_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Reads the JWT from the "Authorization: Bearer" header or the httpOnly cookie.
 * The header is needed when the frontend and backend are deployed on different
 * sites, because browsers like Safari and Brave block cookies between sites.
 */
export function verifyJWT(req) {
  const authorization = req.headers.get("authorization") ?? "";
  const headerToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
  const cookieToken = req.cookies.get(TOKEN_COOKIE_NAME)?.value;

  for (const token of [headerToken, cookieToken]) {
    if (!token) {
      continue;
    }
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.log(err);
    }
  }
  return null;
}

export function signJWT(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_MAX_AGE_SECONDS },
  );
}

// Cookie settings for the auth token, maxAge 0 removes the cookie.
// In production the frontend is on another site, so the cookie must allow cross-site requests.
export function tokenCookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: IS_PRODUCTION ? "none" : "lax",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: maxAge,
  };
}

/**
 * Returns the logged-in user that proxy.js attached to the request headers,
 * or null when the request did not pass through the auth proxy.
 */
export function getRequestUser(req) {
  const id = req.headers.get(X_HEADER_USER_ID);
  if (!id) {
    return null;
  }
  return {
    id: id,
    email: req.headers.get(X_HEADER_USER_EMAIL),
    username: req.headers.get(X_HEADER_USER_NAME),
    role: req.headers.get(X_HEADER_USER_ROLE),
  };
}
