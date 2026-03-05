import { NextResponse } from "next/server";

export function success<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  );
}

export function error(message: string, status = 500): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

export function validationError(message: string): NextResponse {
  return error(message, 400);
}
