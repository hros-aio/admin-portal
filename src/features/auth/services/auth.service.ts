import { ApiError } from "@/lib/api/result";
import { rawClient } from "@/lib/api/client";
import type { LoginInput } from "@/features/auth/schemas/auth.schema";
import type { components, operations } from "@/types/api.generated";

export type LoginResponse = components["schemas"]["LoginResponse"];
type MfaVerifyRequest = components["schemas"]["MFAVerifyRequest"];
export type PasswordResetRequest = components["schemas"]["PasswordResetRequest"];
export type PasswordResetConfirmRequest = components["schemas"]["PasswordResetConfirmRequest"];
export type PasswordResetRequestResponse =
  operations["passwordResetRequest"]["responses"][200]["content"]["application/json"];
export type PasswordResetConfirmResponse =
  operations["passwordResetConfirm"]["responses"][200]["content"]["application/json"];
export type BiometricChallengeResponse = components["schemas"]["BiometricChallengeResponse"];
export type BiometricVerifyRequest = components["schemas"]["BiometricVerifyRequest"];
export type VerifyBiometricInput = BiometricVerifyRequest;

export interface VerifyMfaInput {
  mfa_token: string;
  code: string;
}

export interface BiometricChallengeInput {
  email: string;
}

function ensureResponseBody<T>(data: T | undefined, status: number, message: string): T {
  if (!data) {
    throw new ApiError(status, {
      code: "EMPTY_RESPONSE",
      message,
    });
  }

  return data;
}

export const authService = {
  async login(credentials: LoginInput): Promise<LoginResponse> {
    const { data, error, response } = await rawClient.POST("/v1/auth/login", {
      body: credentials,
    });
    const status = response.status;

    if (error) {
      throw new ApiError(status, {
        code: error.code,
        message: error.message,
      });
    }

    return ensureResponseBody(
      data,
      status,
      "Authentication response did not contain a response body."
    );
  },

  async verifyMfa(values: VerifyMfaInput): Promise<LoginResponse> {
    const body: MfaVerifyRequest = {
      mfa_token: values.mfa_token,
      method: "totp",
      code: values.code,
    };

    const { data, error, response } = await rawClient.POST("/v1/auth/mfa/verify", {
      body,
    });
    const status = response.status;

    if (error) {
      throw new ApiError(status, {
        code: error.code,
        message: error.message,
      });
    }

    return ensureResponseBody(
      data,
      status,
      "Authentication response did not contain a response body."
    );
  },

  async createBiometricChallenge(
    values: BiometricChallengeInput
  ): Promise<BiometricChallengeResponse> {
    const { data, error, response } = await rawClient.POST("/v1/auth/biometric/challenge", {
      body: values,
    });
    const status = response.status;

    if (error) {
      throw new ApiError(status, {
        code: error.code,
        message: error.message,
      });
    }

    return ensureResponseBody(
      data,
      status,
      "Biometric challenge response did not contain a response body."
    );
  },

  async verifyBiometric(values: VerifyBiometricInput): Promise<LoginResponse> {
    const { data, error, response } = await rawClient.POST("/v1/auth/biometric/verify", {
      body: values,
    });
    const status = response.status;

    if (error) {
      throw new ApiError(status, {
        code: error.code,
        message: error.message,
      });
    }

    return ensureResponseBody(
      data,
      status,
      "Authentication response did not contain a response body."
    );
  },

  /**
   * Refresh the access token using the backend's refresh token cookie.
   * @returns The new access token.
   * @throws {ApiError} when the refresh endpoint returns an error or no token.
   */
  async refreshSession(): Promise<string> {
    const { data, error, response } = await rawClient.POST("/v1/auth/refresh", {
      body: { refresh_token: "" },
    });
    const status = response.status;

    if (error) {
      throw new ApiError(status, {
        code: error.code,
        message: error.message,
      });
    }

    const accessToken = data.access_token;

    if (!accessToken) {
      throw new ApiError(status, {
        code: "EMPTY_RESPONSE",
        message: "Refresh response did not contain an access token.",
      });
    }

    return accessToken;
  },

  async requestPasswordReset(values: PasswordResetRequest): Promise<PasswordResetRequestResponse> {
    const { data, error, response } = await rawClient.POST("/v1/auth/password-reset/request", {
      body: values,
    });
    const status = response.status;

    if (error) {
      throw new ApiError(status, {
        code: error.code,
        message: error.message,
      });
    }

    return ensureResponseBody(
      data,
      status,
      "Password reset request response did not contain a response body."
    );
  },

  async confirmPasswordReset(
    values: PasswordResetConfirmRequest
  ): Promise<PasswordResetConfirmResponse> {
    const { data, error, response } = await rawClient.POST("/v1/auth/password-reset/confirm", {
      body: values,
    });
    const status = response.status;

    if (error) {
      throw new ApiError(status, {
        code: error.code,
        message: error.message,
      });
    }

    return ensureResponseBody(
      data,
      status,
      "Password reset confirmation response did not contain a response body."
    );
  },
};
