# Backend Contract: Accept Invite UI & Logic

## Endpoint

`POST /v1/auth/accept-invite`

## Request

Generated type: `components["schemas"]["AcceptInviteRequest"]`

```json
{
  "token": "uuid-invite-token-here",
  "password": "NewSecurePass123!",
  "password_confirmation": "NewSecurePass123!"
}
```

## Success Response

Generated response: `operations["acceptInvite"]["responses"][200]["content"]["application/json"]`

```json
{
  "message": "Account activated successfully."
}
```

## Error Responses

- `400 INVITE_EXPIRED`: Show "This invitation has expired..." and do not redirect.
- `400 INVITE_USED`: Show a clear used-invitation message and do not redirect.
- `422 PASSWORD_WEAK`: Show password-field feedback and do not redirect.
- Other error codes: Show safe retry feedback and do not expose token internals.

## Frontend Service Requirements

- `authService.acceptInvite(values)` is the only frontend caller of this endpoint.
- The service uses generated request/response types and `rawClient.POST("/v1/auth/accept-invite", { body: values })`.
- The service throws `ApiError` with the backend code and status preserved.
- Components and hooks do not call `rawClient` directly.
