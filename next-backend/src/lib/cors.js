// The deployed frontend URL comes from FRONTEND_URL, local development uses the Vite dev server
const allowedOrigin = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).replace(/\/+$/, "");

let corsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export default corsHeaders;
