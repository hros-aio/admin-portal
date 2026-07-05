import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render } from "@/tests/test-utils";
import PasswordResetRequestPage from "./page";

describe("PasswordResetRequestPage", () => {
  it("renders the password reset request form", () => {
    render(<PasswordResetRequestPage />);

    expect(screen.getByRole("heading", { name: "Reset Your Password" })).toBeInTheDocument();
    expect(screen.getByLabelText("Work Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send Reset Link" })).toBeInTheDocument();
  });
});
