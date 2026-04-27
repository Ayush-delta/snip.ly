const { z } = require('zod');

const hexColor = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid CSS hex color (e.g. #fff or #1a1a26).');

const createCtaSchema = z.object({
  shortCode: z
    .string({ required_error: 'shortCode is required.' })
    .trim()
    .regex(
      /^[a-zA-Z0-9_-]{1,20}$/,
      'shortCode must be 1–20 alphanumeric characters, hyphens, or underscores.'
    ),

  message: z
    .string({ required_error: 'message is required.' })
    .trim()
    .min(1, 'Message cannot be empty.')
    .max(280, 'Message must be 280 characters or fewer.'),

  buttonText: z
    .string()
    .trim()
    .min(1, 'Button text cannot be empty.')
    .max(50, 'Button text must be 50 characters or fewer.')
    .default('Visit Us'),

  buttonUrl: z
    .string()
    .trim()
    .max(2048, 'Button URL must be 2048 characters or fewer.')
    .refine(
      (val) => {
        try {
          return ['http:', 'https:'].includes(new URL(val).protocol);
        } catch {
          return false;
        }
      },
      { message: 'Button URL must be a valid http or https URL.' }
    )
    .optional()
    .or(z.literal('')),     

  position: z
    .enum(
      ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center'],
      { errorMap: () => ({ message: 'position must be one of: top-left, top-right, bottom-left, bottom-right, top-center, bottom-center.' }) }
    )
    .default('bottom-left'),

  bgColor:   hexColor.default('#1a1a26'),
  textColor: hexColor.default('#e8e8f0'),
  btnColor:  hexColor.default('#00e5ff'),

  enabled: z.boolean().default(true),
});

module.exports = { createCtaSchema };
