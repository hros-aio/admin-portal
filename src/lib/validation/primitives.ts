import { z } from "zod";

export const emailSchema = z.string().email("Enter a valid email address");

export const uuidSchema = z.string().uuid();

export const strongPasswordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a special character");

export const isoDateSchema = z.string().date();

export const moneyAmountSchema = z
  .number()
  .int("Amount must be a whole number of cents")
  .nonnegative("Amount must be non-negative");
