# HROS Admin Authentication Design

Source: Figma file `PklSc6NkOrich9e6js5Uzy`, page `admin portal`, page node `0:1`.

This document is generated from Figma MCP metadata plus design context for every top-level frame on the page. It is a design specification only; it does not define implementation code.

## Screen Inventory

Figma MCP top-level frame inventory:

| #   | Screen                        | Node ID |           Size | Status     |
| --- | ----------------------------- | ------: | -------------: | ---------- |
| 1   | Password Reset Request        |   `1:2` |  `1280 x 1022` | Documented |
| 2   | HROS Admin - Login (Enhanced) |  `1:64` |  `1280 x 1024` | Documented |
| 3   | Create New Password           | `1:145` |  `1280 x 1022` | Documented |
| 4   | MFA Verification              | `1:255` |  `1280 x 1024` | Documented |
| 5   | Accept Invitation             | `1:323` |  `1280 x 1024` | Documented |
| 6   | Account Locked                | `1:408` |  `1280 x 1024` | Documented |
| 7   | SSO Transition                | `1:474` |  `1280 x 1117` | Documented |
| 8   | HROS Admin - Login (Mobile)   | `1:520` | `390 x 878.67` | Documented |

Comparison with the previous `docs/DESIGN.md`:

- Already covered: `Password Reset Request`, `HROS Admin - Login (Enhanced)`, `Create New Password`, `Account Locked`, `SSO Transition`, `HROS Admin - Login (Mobile)`.
- Missing before this update: `MFA Verification`, `Accept Invitation`.
- Missing after this update: none known from MCP top-level frame inventory.

## Global Design Tokens

### Typography

Font family: `Inter`.

| Token          | Value                                                             | Usage                            |
| -------------- | ----------------------------------------------------------------- | -------------------------------- |
| Brand display  | `36px / 44px`, weight `700`, letter spacing `-0.72px` to `-0.9px` | `HROS Admin` brand wordmark      |
| Screen heading | `28px / 36px`, weight `600`, letter spacing `-0.28px`             | Card-level page titles           |
| Module heading | `20px / 28px`, weight `600`, letter spacing `-0.5px`              | SSO loading module heading       |
| Body           | `14px / 20px`, weight `400`                                       | Standard helper copy             |
| Body large     | `16px / 24px` or `16px / 26px`, weight `400`                      | Explanatory copy and status text |
| Label          | `12px / 16px`, weight `600`, tracking `0.6px`                     | Desktop form labels              |
| Mobile label   | `12px / 16px`, weight `600`, tracking `1.2px`, uppercase          | Mobile form labels               |
| Primary button | `20px / 28px`, weight `600`                                       | Large primary CTAs               |
| Compact button | `16px / 24px`, weight `400`                                       | Compact or transactional CTAs    |
| Footer/legal   | `11px` to `14px`, line height `14px` to `20px`                    | Legal copy, security metadata    |

### Colors

| Token             | Value                       | Usage                                             |
| ----------------- | --------------------------- | ------------------------------------------------- |
| Brand primary     | `#1e00a9`                   | Primary buttons, links, brand text, progress fill |
| Brand bright      | `#3525cd`                   | Logo icon backgrounds                             |
| Brand dark        | `#0f0069`                   | Avatar initials                                   |
| Page background   | `#f9f9ff`                   | All auth surfaces                                 |
| Surface           | `rgba(255, 255, 255, 0.95)` | Cards, top bars                                   |
| White             | `#ffffff`                   | Inputs and button text                            |
| Text strong       | `#151c27`                   | Headings and high-priority text                   |
| Text standard     | `#464555`                   | Body and neutral links                            |
| Text muted        | `#777587`                   | Captions, security metadata                       |
| Placeholder       | `#6b7280`, `#c7c4d8`        | Input placeholder and lower-emphasis text         |
| Surface border    | `#e5e7eb`                   | Card borders                                      |
| Input border      | `#c7c4d8`                   | Default field borders                             |
| Soft divider      | `rgba(199, 196, 216, 0.5)`  | Divider lines                                     |
| Subtle divider    | `rgba(199, 196, 216, 0.3)`  | Top bar borders, secondary panels                 |
| Soft indigo panel | `#f0f3ff`                   | MFA trust panel, cooldown, FaceID                 |
| Soft indigo icon  | `#e2dfff`                   | Circular icon headers                             |
| Progress track    | `#e7eefe`                   | Progress bars and invite icon background          |
| Strength track    | `#e2e8f8`                   | Password strength meter                           |
| Error surface     | `#ffdad6`                   | Error banner                                      |
| Error text        | `#93000a`                   | Error message text                                |
| Error accent      | `#ba1a1a`                   | Alert icon and account lock badge                 |
| Success/security  | `#9af2c5`                   | Role badge, security badge                        |
| Success text      | `#006c49`, `#0c714d`        | Secure provisioning and role text                 |

### Spacing And Sizing

- Base spacing follows a 4px grid.
- Page horizontal padding: `16px` on main content wrappers, `24px` in desktop top app bars.
- Desktop card padding: `33px`.
- Mobile login card padding: `25px`.
- Major vertical gaps: `32px`.
- Form field and control gaps: `24px`.
- Password and registration form gaps: `16px`.
- Label-to-input gap: `4px`.
- Icon/text gaps: `4px`, `8px`, or `16px` depending density.
- Standard input height: `48px`.
- Create-password input height: `57px`.
- OTP input size: `48px x 56px`.
- Desktop primary login button height: `56px`.
- Reset request button height: `48px`.
- Mobile FaceID button height: `48px`.
- Card radius: `12px`.
- Input/button radius: `8px`.
- Pill radius: `9999px`.
- Field icon sizes: `16px` to `20px`.
- Primary button trailing icon: `16px`.
- Icon header sizes: `56px`, `64px`, `80px`, or `96px` by screen.

### Effects

- Top app bar backdrop blur: `6px`.
- Card backdrop blur: `5px` to `6px`.
- Background decorative blur: `40px` to `60px`.
- Standard card shadow: `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)`.
- Transactional card shadow: `0 10px 25px -5px rgba(30,0,169,0.1), 0 8px 10px -6px rgba(30,0,169,0.1)`.
- Primary button shadow: `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)`.
- Progress fill glow: `0 0 12px rgba(30,0,169,0.3)`.

## Shared Components

### Auth Page Shell

- Base layout for every screen.
- Uses `#f9f9ff` page background.
- Supports centered single-column transactional content.
- Desktop transactional screens use a fixed `64px` top navigation region.
- Footers sit near the bottom of the viewport and remain visually secondary.

### Atmospheric Background

- Decorative, non-interactive layer behind all cards.
- Uses indigo and green radial blur overlays:
  - Indigo: `rgba(30, 0, 169, 0.05)` or stronger `rgba(30, 0, 169, 0.10)` for SSO.
  - Green: `rgba(0, 108, 73, 0.05)`.
- Blurs are large circular or pill shapes with `9999px` radius.
- Desktop login may add a right-side decorative image and a low-opacity zero-trust badge.
- Decorative layers must be hidden from assistive technology.

### Top App Bar

- Height: `64px`.
- Background: `rgba(255,255,255,0.95)`.
- Backdrop blur: `6px`.
- Bottom border: `rgba(199,196,216,0.3)`.
- Shadow: standard top bar shadow.
- Horizontal padding: `24px`.
- Left area:
  - Either brand text only or a `32px` brand icon followed by brand text.
  - Brand text uses `36px / 44px`, weight `700`, color `#1e00a9`.
- Right area:
  - Two icon-only actions, approximately `32px` to `36px`.
  - Actions need accessible names such as "Help" and "Security status".

### Auth Card

- Surface: `rgba(255,255,255,0.95)`.
- Border: `1px solid #e5e7eb`.
- Radius: `12px`.
- Backdrop blur: `5px` to `6px`.
- Padding: `33px` desktop, `25px` mobile.
- Used as the primary framing element. Do not nest cards inside cards.
- Functional panels inside cards are allowed for validation, MFA trust, user badge, cooldown, and FaceID.

### Footer

- Copyright: `© 2024 HROS Admin. All sessions are encrypted.`
- Optional brand label: `HROS Admin`.
- Link group: `Support`, `Terms`, `Privacy`.
- Text sizes range from `11px` to `16px` depending frame.
- Footer links must be keyboard reachable and visibly focusable.

### Form Field

- Default input background: `#ffffff`.
- Border: `#c7c4d8`.
- Radius: `8px`.
- Standard height: `48px`.
- Icon offset: `16px` left.
- Text starts near `45px`.
- Focus state uses brand/focus border; MFA OTP uses `#2563eb` focus border and `0 0 0 1px #2563eb` ring.
- Invalid state must combine border/icon color, message text, and non-color affordance.

### Primary Button

- Background: `#1e00a9`.
- Text: `#ffffff`.
- Radius: `8px`.
- Full width inside forms.
- Large labels use `20px / 28px`, weight `600`.
- Compact labels use `16px / 24px`.
- Supports leading or trailing icons.

### Secondary Actions

- Outlined buttons use white or transparent background, `#c7c4d8` border, and `#151c27` text.
- Subtle filled actions use `#f0f3ff` or `#dce3f2`.
- Text links use `#1e00a9` for primary navigation or `#464555` for lower-emphasis actions.
- Hover and focus states must not rely on color alone.

## Per-Screen Specification

### Password Reset Request

**Screen name:** `Password Reset Request` (`1:2`)

**Purpose:** Allows an admin to request a secure password recovery link by entering a work email address.

**Layout:**

- Desktop transactional shell, `1280 x 1022`.
- `TopAppBar` fixed at the top, `64px` high.
- Main content begins below the top bar.
- Centered card max width `440px`.
- Main content has `16px` horizontal padding and generous vertical centering.
- Footer spans the bottom with copyright and links.

**Components:**

- Atmospheric background with blurred indigo accents.
- Shared top app bar with brand and two icon actions.
- Auth card:
  - `64px` circular email icon header on `#e2dfff`.
  - Heading: `Reset Your Password`.
  - Two-line helper copy.
  - Work email field with mail icon.
  - Primary `Send Reset Link` button with trailing arrow.
  - `Back to Login` link with left arrow icon.
- Shared footer with `Support`, `Terms`, `Privacy`.

**Typography:**

- Heading: `28px / 36px`, weight `600`, color `#151c27`.
- Helper copy: `14px / 20px`, color `#464555`, centered.
- Label: `12px / 16px`, weight `600`, tracking `0.6px`.
- Button: `16px / 24px`, white.
- Footer: `14px / 20px`.

**Colors:**

- Surface: `rgba(255,255,255,0.95)`.
- Brand primary button: `#1e00a9`.
- Input border: `#c7c4d8`.
- Icon background: `#e2dfff`.
- Text: `#151c27`, `#464555`.

**Spacing:**

- Card padding: `33px`.
- Icon margin bottom: `24px`.
- Heading bottom space: `8px`.
- Description bottom space: `32px`.
- Form gap: `24px`.
- Footer action top padding: `32px`.

**Responsive behavior:**

- On narrow screens, card should fill available width inside `16px` page padding.
- Top app bar content should compress without truncating the brand or icon actions.
- Footer links should wrap or stack.

**States:**

- Input default, focus, invalid, and disabled.
- Button default, hover/focus, loading, disabled.
- Recovery success or rate-limit state is not shown in Figma.

**Accessibility notes:**

- Email field must have a programmatic label.
- `Back to Login` must be a link or button with visible focus.
- Recovery submission status should be announced through a polite live region.

### HROS Admin - Login (Enhanced)

**Screen name:** `HROS Admin - Login (Enhanced)` (`1:64`)

**Purpose:** Desktop sign-in entry point for HROS super admin access.

**Layout:**

- Desktop login frame, `1280 x 1024`.
- Full-page centered auth canvas with max width `448px`.
- Auth card width `416px`.
- Main content is vertically centered with `175px` top/bottom padding in the frame.
- Decorative image area occupies the right third of the desktop frame at low opacity.
- Low-opacity zero-trust badge sits bottom-left.

**Components:**

- Atmospheric background with indigo/green blur overlays and faint radial gradient.
- Optional decorative right-side image.
- `Zero-Trust Verified` badge with green icon.
- Auth card:
  - Logo and `HROS Admin` brand.
  - Subtitle `SECURE SUPER ADMIN PORTAL ACCESS`.
  - Email input with mail icon.
  - Password input with lock icon, `Forgot Password?` link, and `SHOW` toggle.
  - `Remember me for 30 days` checkbox.
  - Primary `Sign In to Dashboard` button with trailing arrow.
  - Divider: `OR CONTINUE WITH`.
  - Secondary `SSO` and `Biometric` buttons.
- Footer info with `Contact IT Support` and encrypted-session copyright.

**Typography:**

- Brand: `36px / 44px`, weight `700`, color `#1e00a9`, letter spacing `-0.9px`.
- Subtitle: `12px / 16px`, weight `600`, uppercase, tracking `1.2px`.
- Labels: `12px / 16px`, weight `600`.
- Input text: `14px`.
- Primary button: `20px / 28px`, weight `600`.
- Secondary action labels: `12px / 16px`, weight `600`, tracking `0.6px`.

**Colors:**

- Page: `#f9f9ff`.
- Card: `rgba(255,255,255,0.95)`.
- Primary: `#1e00a9`.
- Text: `#151c27`, `#464555`, `#777587`.
- Input border: `#c7c4d8`.
- Divider: `rgba(199,196,216,0.5)`.
- Badge green: `#9af2c5`.

**Spacing:**

- Auth canvas width: `448px` with `16px` horizontal padding.
- Card padding: `33px`.
- Header gap: `8px`.
- Form gap: `24px`.
- Secondary action gap: `16px`.
- Input height: `48px`.
- Primary button height: `56px`.

**Responsive behavior:**

- At mobile widths, use the dedicated mobile login design rather than scaling this desktop design.
- Decorative image and zero-trust badge should hide or move below the main content on small screens.

**States:**

- Email/password focus, invalid, disabled.
- Password visibility toggle.
- Remember-me checked/unchecked.
- Primary button loading/disabled.
- SSO and biometric actions default/focus/loading.

**Accessibility notes:**

- Use explicit labels for email, password, remember-me checkbox, and password visibility control.
- Password toggle must announce `Show password` or `Hide password`.
- The decorative image and badge icon should not interrupt screen reader flow unless the badge is meaningful.

### Create New Password

**Screen name:** `Create New Password` (`1:145`)

**Purpose:** Lets an admin set a new password after a reset link, including validation and expired-token feedback.

**Layout:**

- Desktop transactional shell, `1280 x 1022`.
- Shared top app bar at `64px`.
- Center column max width `448px`.
- Main area begins below top bar.
- Optional error banner sits above the password card.
- Password card width resolves to `416px`; inner form content resolves to `350px`.
- Shared footer below card.

**Components:**

- Atmospheric background with indigo and green blur overlays.
- Error banner:
  - Text: `This token has expired. Please request a new password reset link.`
  - Alert icon and dismiss icon.
- Auth card:
  - `56px` circular key icon header.
  - Heading: `Create New Password`.
  - Helper copy about strong unique password.
  - New password field with lock icon and visibility toggle.
  - Password strength meter with four segments.
  - Validation checklist with four requirements.
  - Confirm password field with shield/lock icon and visibility toggle.
  - Primary `Update Password and Login` button with trailing arrow.
- Shared footer.

**Typography:**

- Heading: `28px / 36px`, weight `600`.
- Helper copy: `14px / 20px`.
- Labels: `12px / 16px`, weight `600`, tracking `0.6px`.
- Input text: `16px`.
- Strength labels: `11px / 14px`.
- Primary button: `20px / 28px`, weight `600`.
- Error text: `14px / 20px`, color `#93000a`.

**Colors:**

- Error surface: `#ffdad6`.
- Error border: `rgba(186,26,26,0.2)`.
- Error text: `#93000a`.
- Card surface: `rgba(255,255,255,0.95)`.
- Input border: `rgba(199,196,216,0.6)`.
- Strength track: `#e2e8f8`.
- Empty strength segments: `#c7c4d8`.
- Validation panel: `rgba(240,243,255,0.5)`.

**Spacing:**

- Outer column gap: `24px`.
- Card padding: `33px`.
- Card internal gap: `32px`.
- Form gap: `16px`.
- Error banner padding: `17px`.
- Validation panel padding: `17px`.
- Button top margin: `16px`.

**Responsive behavior:**

- On smaller widths, keep the error banner and card in the same order and use `16px` page padding.
- Allow helper and error text to wrap.
- Do not preserve desktop absolute offsets on narrow screens.

**States:**

- Token expired banner visible/dismissed.
- Password empty, weak, medium, strong.
- Checklist unmet/met.
- Password mismatch.
- Visibility toggles for both password fields.
- Submit disabled until valid.

**Accessibility notes:**

- Error banner should use alert semantics when it appears.
- Password requirements must be available as text, not icon-only state.
- Strength changes should be announced politely.
- Focus should move to the first invalid field after failed submit.

### MFA Verification

**Screen name:** `MFA Verification` (`1:255`)

**Purpose:** Collects a six-digit authenticator code and offers fallback security-key authentication.

**Layout:**

- Desktop transactional frame, `1280 x 1024`.
- Shared top app bar at `64px`.
- Main content centered with `192px` top padding and `128px` bottom padding.
- Card max width `480px`, padding `33px`.
- Footer below main content with copyright and links.

**Components:**

- Atmospheric background with indigo and green blur overlays.
- Contextual top navigation bar.
- Auth card:
  - `64px` shield icon header on `#e2dfff`.
  - Heading: `Two-Factor Verification`.
  - Helper copy: `Enter the 6-digit code from your authenticator app.`
  - OTP input section:
    - Six boxes, each `48px x 56px`.
    - Gap `8px`.
    - Dot separator after the third digit.
    - First input shown focused with blue border/ring.
  - Meta row:
    - Timer: `Code expires in 01:52`.
    - Disabled resend action: `Resend Code`.
  - Trust device checkbox panel.
  - Alternative auth pill: `Alternative: Use WebAuthn / Security Key`.
  - Text action: `Cancel and Return to Login`.
  - Security assurance line: `END-TO-END ENCRYPTED SESSION`.
- Shared footer.

**Typography:**

- Heading: `28px / 36px`, weight `600`, color `#151c27`.
- Helper: `14px / 20px`, color `#464555`.
- Timer and action text: `16px / 24px`.
- Security assurance: `16px / 24px`, uppercase, tracking `1.6px`, color `#777587`.
- Footer links: `16px / 24px`.

**Colors:**

- Focused OTP border: `#2563eb`.
- Default OTP border: `#c7c4d8`.
- Trust panel: `#f0f3ff`.
- Alternative auth pill: `#dce3f2`.
- Text muted: `#777587`.
- Brand: `#1e00a9`.

**Spacing:**

- Card padding: `33px`.
- Icon bottom margin: `24px`.
- Heading bottom margin: `4px`.
- Helper bottom margin: `32px`.
- OTP section bottom margin: `24px`.
- Meta controls gap: `16px`.
- Actions top padding: `16px`.
- Security assurance top padding: `32px`.

**Responsive behavior:**

- OTP inputs must fit within the card at small widths. Reduce gap or input width before allowing overflow.
- Timer/resend row can stack on mobile.
- Alternative auth pill should wrap text or become full-width.
- Footer links wrap or stack.

**States:**

- OTP empty, focused, filled, invalid, complete, disabled.
- Timer active/expired.
- Resend disabled while timer is active, enabled when expired.
- Trust device checked/unchecked.
- WebAuthn fallback pending/success/error.
- Cancel action default/focus.

**Accessibility notes:**

- OTP should be one grouped verification-code control or six fields with clear labels such as `Digit 1 of 6`.
- Support paste of the full six-digit code.
- Announce expiration countdown changes at sensible intervals, not every second.
- Disabled resend must expose disabled state.
- WebAuthn fallback must identify the required security-key action.

### Accept Invitation

**Screen name:** `Accept Invitation` (`1:323`)

**Purpose:** Lets an invited admin review invitation context and create an account password.

**Layout:**

- Desktop transactional frame, `1280 x 1024`.
- Shared top bar at `64px`, with brand icon plus `HROS Admin`.
- Main card centered with `152.5px` top padding and `104.5px` bottom padding.
- Card max width `540px`, padding `33px`, gap `24px`.
- Footer below main content.

**Components:**

- Atmospheric background with faint radial layer and blurred indigo/green gradients.
- Suppressed transactional top navigation.
- Invite card:
  - `64px` circular organization/avatar image area on `#e7eefe`.
  - Heading: `You have been invited to join Acme Corp Global`.
  - Helper copy: `Administrative invitation for the HROS secure environment.`
  - User badge panel:
    - Avatar initials `AR`.
    - Label `EMAIL ADDRESS`.
    - Email `alex.r@acmecorp.com`.
    - Role pill `Super Admin`.
  - Registration form:
    - Create new password field with lock icon and visibility icon.
    - Confirm password field with shield icon.
    - Primary `Accept Invitation & Create Account` button with trailing arrow.
  - Security footer:
    - Enterprise Security Policy agreement text.
    - `End-to-End Encrypted Provisioning` assurance.
- Shared footer with `Support`, `Terms`, `Privacy`.

**Typography:**

- Heading: `28px / 36px`, weight `600`, centered.
- Helper: `14px / 20px`, color `#464555`.
- Badge label: `12px / 16px`, uppercase, tracking `0.6px`.
- Email: `16px / 24px`, weight `600`, brand primary.
- Role pill: `12px / 16px`, weight `600`.
- Input text: `14px`.
- Primary button: `20px / 28px`, weight `600`.
- Security policy text: `11px / 14px`.
- Provisioning assurance: `12px / 16px`, weight `600`.

**Colors:**

- Invite icon background: `#e7eefe`.
- User badge panel: `#f0f3ff`.
- Avatar background: `#e2dfff`.
- Avatar text: `#0f0069`.
- Email and links: `#1e00a9`.
- Role pill: `#9af2c5`.
- Role text: `#0c714d`.
- Secure provisioning text: `#006c49`.
- Input border: `#c7c4d8`.

**Spacing:**

- Card padding: `33px`.
- Card gap: `24px`.
- Invite context gap: `16px`.
- Heading/helper gap: `4px`.
- Badge padding: `17px`.
- Registration form gap: `16px`.
- Field label padding: `4px` horizontal.
- Button top padding: `8px`.
- Security footer top border and `17px` top padding.

**Responsive behavior:**

- Card should become full-width within `16px` page padding.
- Heading must wrap naturally for long organization names.
- User badge should stack avatar/email and role pill when width is limited.
- Primary button text may wrap; keep height flexible.

**States:**

- Invitation valid/expired/accepted already.
- Password empty/invalid/valid.
- Confirm password mismatch.
- Visibility toggle for new password.
- Primary button loading/disabled.
- Enterprise policy link focus/hover.

**Accessibility notes:**

- Organization image/avatar requires alt text if meaningful; otherwise mark decorative.
- Email and role must be exposed as text.
- Enterprise Security Policy must be a real link with visible focus.
- Invitation acceptance status should be announced after submit.

### Account Locked

**Screen name:** `Account Locked` (`1:408`)

**Purpose:** Communicates temporary account lockout after failed login attempts and provides recovery actions.

**Layout:**

- Desktop transactional frame, `1280 x 1024`.
- Shared top navigation at `64px`.
- Main region below top bar with centered card.
- Card size: `480px x 622px`.
- Footer includes security log metadata.

**Components:**

- Atmospheric background with large indigo and green blur overlays.
- Top navigation with brand and two icon actions.
- Auth card:
  - `96px` lock illustration with red alert badge.
  - Heading: `Account Temporarily Locked`.
  - Four-line explanation copy.
  - Cooldown timer panel.
  - Primary `Contact IT Support` button with support icon.
  - Secondary `Return to Login` text button.
- Footer with `HROS Admin`, copyright, `Security Log ID: SEC-9921-X`, and links.

**Typography:**

- Heading: `28px / 36px`, weight `600`.
- Explanation copy: `16px / 26px`.
- Timer label: `16px / 24px`, uppercase, tracking `0.8px`.
- Countdown: `36px / 44px`, weight `700`, color `#1e00a9`.
- Buttons: `16px / 24px`.

**Colors:**

- Lock background: `rgba(186,26,26,0.1)`.
- Alert badge: `#ba1a1a`.
- Cooldown panel: `#f0f3ff`.
- Panel border: `rgba(199,196,216,0.5)`.
- Primary action: `#1e00a9`.

**Spacing:**

- Illustration top offset: `32px`, bottom margin `24px`.
- Heading to copy: `16px`.
- Copy to cooldown: `24px`.
- Cooldown panel padding: `17px 33px`.
- Action button gap: `8px`.
- Card side action inset: `32px`.

**Responsive behavior:**

- Fixed card height should become content-driven on narrow screens.
- Countdown panel should remain centered and wrap if needed.
- Footer metadata and links should stack.

**States:**

- Countdown active.
- Countdown complete with retry enabled.
- Contact support loading/error.
- Return to login focus/hover.

**Accessibility notes:**

- Lockout status should be announced as a status or alert.
- Countdown should not announce every second; announce initial lockout and meaningful threshold changes.
- Security log id should be selectable/readable text.

### SSO Transition

**Screen name:** `SSO Transition` (`1:474`)

**Purpose:** Shows secure sign-in progress while handshaking with an organization identity provider.

**Layout:**

- Desktop frame, `1280 x 1117`.
- Full-height centered main canvas.
- Loading module max width `448px`, height `340px`.
- Cancel button below the module.
- Footer identity fixed near the bottom.

**Components:**

- Atmospheric background with dot/radial pattern and blurred accents.
- Center loading module:
  - `80px` pulsing circular logo.
  - Heading: `Signing you in securely...`
  - Status line: `Verifying identity with organization SSO`.
  - Linear progress bar.
  - Status message: `Handshaking with identity provider...`.
  - Percentage: `19%`.
- Secondary `Cancel` pill button.
- Footer identity: `HROS Admin | SECURE TERMINAL` and encrypted-session copy.

**Typography:**

- Module heading: `20px / 28px`, weight `600`.
- Status line: `16px / 24px`.
- Progress status: `12px / 16px`, weight `600`, tracking `0.6px`.
- Footer brand/security: `12px / 16px`.
- Footer copyright: `11px / 14px`.

**Colors:**

- Logo background: `#3525cd`.
- Logo pulse overlays: `rgba(30,0,169,0.2)` and `rgba(30,0,169,0.1)`.
- Progress track: `#e7eefe`.
- Progress fill: `#1e00a9`.
- Muted status: `#777587`.

**Spacing:**

- Module internal top logo offset: `32px`.
- Identity text starts around `144px` from module top.
- Progress section starts around `236px`.
- Progress gap: `16px`.
- Cancel top padding: `32px`.
- Footer vertical padding: `24px`.

**Responsive behavior:**

- Module should fill available width within `16px` page padding.
- Footer can remain bottom-centered but must not overlap the module on short screens.
- Long identity-provider status text should wrap.

**States:**

- Progress updates.
- Pending, success redirect, error/retry.
- Cancel available.
- Reduced-motion mode should avoid pulsing animation.

**Accessibility notes:**

- Loading status must be text-based and announced with a polite live region.
- Progress bar needs accessible progress semantics when determinate.
- Cancel must be keyboard accessible.
- Animation should respect reduced-motion preferences.

### HROS Admin - Login (Mobile)

**Screen name:** `HROS Admin - Login (Mobile)` (`1:520`)

**Purpose:** Mobile-optimized sign-in flow for HROS Admin.

**Layout:**

- Mobile frame, `390 x 878.67`.
- No top app bar in this mobile login frame.
- Page padding: `16px`.
- Main content wrapper uses `67.5px` vertical padding.
- Auth container max width `384px`.
- Card width `358px`.
- Form width `308px`.
- Footer segment sits below main wrapper.

**Components:**

- Atmospheric background with indigo/green blur overlays.
- Branding header:
  - `64px` brand icon block.
  - `HROS Admin`.
  - Subtitle `Administrative Control Gateway`.
- Login card:
  - Email field.
  - Password field with short `Forgot?` link.
  - Primary `Sign In` button with trailing arrow.
  - FaceID section with `SIGN IN WITH FACEID`.
- Additional info line: `Requires 2FA for external sessions`.
- Footer:
  - `SUPPORT`.
  - Dot separator.
  - `PRIVACY`.
  - Copyright.

**Typography:**

- Brand: `36px / 44px`, weight `700`, color `#1e00a9`.
- Subtitle: `16px / 24px`, color `#464555`.
- Labels: `12px / 16px`, uppercase, tracking `1.2px`.
- Inputs: `16px`.
- Primary button: `20px / 28px`, weight `600`.
- FaceID label: `12px / 16px`, uppercase, tracking `0.3px`.
- Footer links: `12px / 16px`, uppercase, tracking `1.2px`.

**Colors:**

- Logo background: `#3525cd`.
- Card: `rgba(255,255,255,0.95)`.
- Input border: `#c7c4d8`.
- FaceID background: `#f0f3ff`.
- Footer separator: `#c7c4d8`.

**Spacing:**

- Main wrapper padding: `16px` horizontal, `67.5px` vertical.
- Auth container gap: `32px`.
- Branding header gap: `8px`.
- Logo padding: `16px`.
- Card padding: `25px`.
- Form gap: `24px`.
- FaceID top border section padding: `17px`.
- Footer padding: `32px`, gap `16px`.

**Responsive behavior:**

- This is the reference narrow layout.
- It should support widths below `390px` by using fluid card width within `16px` page padding.
- Long footer or help text should wrap.

**States:**

- Email/password focused, invalid, disabled.
- Forgot link focus/hover.
- Primary button loading/disabled.
- FaceID unavailable, prompt active, success, failure.

**Accessibility notes:**

- Mobile inputs must use proper label associations and input types.
- FaceID action must be a button with clear fallback when biometric auth is unavailable.
- Footer links need visible focus states and adequate tap targets.

## Missing/Unclear Items

- No top-level Figma frames are missing from this document based on MCP enumeration of the `admin portal` page.
- `Password Reset Request` does not show success, email-not-found, or rate-limited variants; these states should be confirmed before implementation.
- `Create New Password` shows an expired-token error banner and an empty password state, but does not show successful validation, mismatch, or completed password states.
- `MFA Verification` shows focused empty OTP and disabled resend, but does not show filled, invalid-code, expired-code, or resend-enabled states.
- `Accept Invitation` shows a valid invitation and empty form, but does not show expired invitation, already-accepted invitation, password validation, or submit error states.
- `Account Locked` shows active cooldown only; completed cooldown and retry-enabled state are not shown.
- `SSO Transition` shows an in-progress state only; success redirect, provider error, retry, and cancellation confirmation states are not shown.
- Mobile-specific variants are only present for the login screen. Mobile layouts for reset request, create password, MFA verification, accept invitation, account locked, and SSO transition are not present as top-level Figma frames.
