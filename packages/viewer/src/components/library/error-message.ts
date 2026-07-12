export function errorMessage(error: unknown): string {
  if (
    error != null &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return String(error);
}
