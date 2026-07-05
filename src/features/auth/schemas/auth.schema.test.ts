import { describe, expect, it } from "vitest";

import { passwordResetFormSchema } from "./auth.schema";

describe("passwordResetFormSchema", () => {
  it("accepts a strong password with matching confirmation", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "StrongPass1!",
      password_confirmation: "StrongPass1!",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a weak password", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "weak",
      password_confirmation: "weak",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a blank confirmation", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "StrongPass1!",
      password_confirmation: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords on password_confirmation", () => {
    const result = passwordResetFormSchema.safeParse({
      password: "StrongPass1!",
      password_confirmation: "Different1!",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["password_confirmation"],
            message: "Passwords do not match",
          }),
        ])
      );
    }
  });
});
