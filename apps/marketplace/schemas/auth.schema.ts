import { z } from "zod";

export function createAuthSchemas() {
  const registerSchema = z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Please enter a valid email"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
      confirmPassword: z.string(),
      terms: z.boolean().refine((value) => value === true, {
        message: "You must accept terms and conditions",
      }),
      lang: z.enum(["en", "th"]).default("en"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  return {
    registerSchema,
  };
}

export type RegisterFormValues = z.infer<ReturnType<typeof createAuthSchemas>["registerSchema"]>;
