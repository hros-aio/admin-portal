import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render } from "@/tests/test-utils";
import CreatePasswordPage from "./page";

describe("CreatePasswordPage", () => {
  it("renders the reset password confirmation form", () => {
    render(<CreatePasswordPage />);

    expect(screen.getByRole("heading", { name: "Create New Password" })).toBeInTheDocument();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Password" })).toBeInTheDocument();
  });
});
