import { z } from "zod";

// ADR Creation Form Schema
export const adrFormSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must be less than 200 characters"),
  status: z.enum(["proposed", "accepted", "superseded", "deprecated"], {
    required_error: "Please select a status",
  }),
  context: z
    .string()
    .min(50, "Context must be at least 50 characters")
    .max(2000, "Context must be less than 2000 characters"),
  decision: z
    .string()
    .min(50, "Decision must be at least 50 characters")
    .max(2000, "Decision must be less than 2000 characters"),
  consequences: z
    .string()
    .min(50, "Consequences must be at least 50 characters")
    .max(2000, "Consequences must be less than 2000 characters"),
  tags: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").map((tag) => tag.trim()) : [])),
});

export type ADRFormData = z.infer<typeof adrFormSchema>;

// Search Form Schema
export const searchFormSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  type: z.enum(["all", "adr", "pattern", "blog", "semantic"]).optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;

// User Settings Schema
export const userSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    desktop: z.boolean(),
  }),
  preferences: z.object({
    defaultView: z.enum(["list", "grid", "timeline"]),
    itemsPerPage: z.number().min(10).max(100),
    autoSave: z.boolean(),
  }),
});

export type UserSettingsData = z.infer<typeof userSettingsSchema>;

// API Response Schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  message: z.string().optional(),
  errors: z.array(z.string()).optional(),
});

export type APIResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
};