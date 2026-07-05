# UI Contract: Accept Invite UI & Logic

## Route

`/accept-invite?token=<invitation-token>`

## Page States

### Missing Token

- Render an invitation-link error.
- Do not render a submittable accept-invite form.
- Do not call the accept-invite mutation.

### Ready

- Render the accept-invite form.
- Include password and password confirmation fields.
- Show password strength and requirements using the existing auth password pattern.
- Submit `token`, `password`, and `password_confirmation` through the accept-invite hook.

### Loading

- Disable password fields, visibility toggles, and submit button.
- Prevent duplicate submissions.

### Success

- Show account-activated success toast.
- Redirect to `/login`.

### Expired Invite

- Render the message "This invitation has expired...".
- Keep the administrator on the accept-invite page.
- Do not redirect.

### Used Invite

- Render a clear used-invitation message.
- Keep the administrator on the accept-invite page.
- Do not redirect.

### Weak Password

- Render password-specific feedback on the password field.
- Keep the administrator on the accept-invite page.
- Do not redirect.

### Unknown Failure

- Render safe retry feedback.
- Keep the administrator on the accept-invite page.
- Do not expose token internals.
