import { z } from "zod";

// Zod schema for epigram submission
export const epigramSubmissionSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required")
    .min(3, "Text must be at least 3 characters")
    .max(150, "Text must be less than 150 characters")
    .trim(),
  author: z
    .string()
    .max(50, "Author name must be less than 50 characters")
    .trim()
    .optional()
    .or(z.literal("")),
});

export type EpigramSubmissionData = z.infer<typeof epigramSubmissionSchema>;

// Validation helper function
export const validateEpigramSubmission = (data: unknown) => {
  return epigramSubmissionSchema.safeParse(data);
};
