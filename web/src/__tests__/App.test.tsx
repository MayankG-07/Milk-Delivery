import { render, screen } from "../test-utils";
import App from "../App";

describe("App", () => {
  test("renders brand name", () => {
    render(<App />);
    const textElements = screen.getAllByText(/milk delivery/i);
    expect(textElements.length).toBe(2);
  });
});
