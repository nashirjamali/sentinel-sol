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
  return { status: 500, body: { error: "Internal server error" } };
}
