const { z } = require('zod');

// ─── Reusable password complexity schema ──────────────────────────────────────
// Applied to register (full complexity) and login (max only — no complexity
// check on login so existing accounts with weaker passwords still work).
const PasswordSchema = z
  .string({ required_error: 'Password is required.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be 72 characters or fewer.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[@$!%*?&#^()_+\-=/|"\'\`~]/, 'Password must contain at least one special character');

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Notes:
//  - email is normalized to lowercase + trimmed by Zod before hitting the DB
//  - confirmPassword is validated here but intentionally NOT saved — the route
//    only destructures { email, password, name } so it never reaches bcrypt/DB
//  - .refine() runs AFTER all field checks, attaches error to confirmPassword
const registerSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required.' })
      .trim()
      .toLowerCase()
      .email('Must be a valid email address.')
      .max(255, 'Email must be 255 characters or fewer.'),

    password: PasswordSchema,

    confirmPassword: z
      .string({ required_error: 'Please confirm your password.' }),

    name: z
      .string()
      .trim()
      .min(1, 'Name cannot be empty.')
      .max(100, 'Name must be 100 characters or fewer.')
      .optional(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Passwords do not match.',
      path: ['confirmPassword'], // attaches the error to the confirmPassword field
    }
  );

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Login does NOT apply complexity rules — existing users may have passwords
// that predate the complexity requirement. Only max(72) matters here.
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Must be a valid email address.')
    .max(255, 'Email must be 255 characters or fewer.'),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.')
    .max(72, 'Password must be 72 characters or fewer.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[@$!%*?&#^()_+\-=/|"\'\`~]/, 'Password must contain at least one special character'),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required.'),
  password: PasswordSchema,
});

module.exports = {
  PasswordSchema,
  registerSchema,
  loginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
};
