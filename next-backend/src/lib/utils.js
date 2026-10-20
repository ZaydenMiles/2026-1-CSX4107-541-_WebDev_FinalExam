// src/lib/utils.js

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import corsHeaders from "./cors";

export function printExceptionLog(logMessage, error) {
  console.log(`==>${logMessage} Exception`);
  console.log(error);
}

export function errorResponse(message, status) {
  return NextResponse.json(
    {
      message: message,
    },
    {
      status: status,
      headers: corsHeaders,
    },
  );
}

export function successResponse(jsonData, status) {
  return NextResponse.json(jsonData, {
    status: status,
    headers: corsHeaders,
  });
}

// Answer for CORS preflight requests
export function optionsResponse() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Parses the JSON body, returns null when the body is missing or malformed
export async function readJsonBody(req) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }
    return body;
  } catch {
    return null;
  }
}

// Converts a string id to an ObjectId, returns null when the id is not valid
export function toObjectId(id) {
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return null;
  }
  return new ObjectId(id);
}
