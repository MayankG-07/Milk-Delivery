export class FetchError extends Error {
  constructor(response, message = "An error occurred") {
    super(message);
  }
  res() {
    return this.response;
  }
}
