import { z } from "zod";

import { emailSchema, strongPasswordSchema } from "@/lib/validation/primitives";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  remember_me: z.boolean(),
});

export const mfaSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: strongPasswordSchema,
    password_confirmation: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export const acceptInviteSchema = passwordResetConfirmSchema;

export type LoginInput = z.infer<typeof loginSchema>;
export type MfaInput = z.infer<typeof mfaSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
