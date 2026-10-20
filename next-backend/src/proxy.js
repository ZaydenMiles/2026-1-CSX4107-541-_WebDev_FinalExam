import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/auth";
import corsHeaders from "./lib/cors";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
  X_HEADER_USER_ROLE,
} from "./lib/constant";

// Requests that may reach a matched route without a login
function isPublicRequest(request) {
  const { pathname } = request.nextUrl;
  // Registering a new account
  return pathname === "/api/user" && request.method === "POST";
}

export function proxy(request) {
  // CORS preflight requests never carry the auth cookie, let the route answer them
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  // Identity headers are only ever set here, never trusted from the client
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(X_HEADER_USER_ID);
  requestHeaders.delete(X_HEADER_USER_EMAIL);
  requestHeaders.delete(X_HEADER_USER_NAME);
  requestHeaders.delete(X_HEADER_USER_ROLE);

  if (isPublicRequest(request)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const user = verifyJWT(request);

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthorized Request",
      },
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }

  requestHeaders.set(X_HEADER_USER_ID, user.id);
  requestHeaders.set(X_HEADER_USER_EMAIL, user.email);
  requestHeaders.set(X_HEADER_USER_NAME, user.username);
  requestHeaders.set(X_HEADER_USER_ROLE, user.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/course/:path*", "/api/user/:path*"],
};
