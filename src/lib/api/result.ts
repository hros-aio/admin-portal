export class ApiError extends Error {
  status: number;
  code: string;
  details: { field: string; issue: string }[] | undefined;

  constructor(
    status: number,
    body: { code: string; message: string; details?: { field: string; issue: string }[] }
  ) {
    super(body.message);
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }
}

export async function unwrap<T>(
  promise: Promise<{
    data?: { data: T; meta?: Record<string, unknown> };
    error?: { code: string; message: string; details?: { field: string; issue: string }[] };
    response: Response;
  }>
): Promise<T> {
  const { data, error, response } = await promise;

  if (error) {
    throw new ApiError(response.status, error);
  }

  if (!data) {
    throw new ApiError(response.status, {
      code: "EMPTY_RESPONSE",
      message: "Received an empty response from the server.",
    });
  }

  return data.data;
}
