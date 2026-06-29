import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("merges tailwind classes", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it.each([
    [false, "base block"],
    [true, "base block"],
  ])("handles conditional classes when hidden=%s", (shouldHide, expected) => {
    expect(cn("base", shouldHide && "hidden", "block")).toBe(expected);
  });
});
