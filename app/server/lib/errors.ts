export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(404, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

export function toErrorResponse(error: unknown): { status: number; body: { error: string } } {
  if (error instanceof ApiError) {
    return { status: error.status, body: { error: error.message } };
  }
  // Unexpected (non-ApiError) failures were being swallowed into a bare "Internal server
  // error" with nothing in the server logs to diagnose from — log the real cause server-side
  // while still keeping the client-facing message generic (don't leak internals in the body).
  console.error("Unhandled error in API route:", error);
  return { status: 500, body: { error: "Internal server error" } };
}
