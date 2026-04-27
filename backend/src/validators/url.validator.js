const { z } = require('zod');

const shortenSchema = z.object({
  url: z
    .string({ required_error: 'URL is required.' })
    .trim()
    .min(1, 'URL is required.')
    .max(2048, 'URL must be 2048 characters or fewer.')
    .refine(
      (val) => {
        try {
          return ['http:', 'https:'].includes(new URL(val).protocol);
        } catch {
          return false;
        }
      },
      { message: 'Must be a valid http or https URL.' }
    ),

  customCode: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9_-]{3,20}$/,
      'Custom code must be 3–20 characters: letters, numbers, hyphens, or underscores only.'
    )
    .optional(),
});

const shortCodeParamSchema = z.object({
  code: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]{1,20}$/,
      'Invalid short code format.'
    ),
});

module.exports = { shortenSchema, shortCodeParamSchema };
