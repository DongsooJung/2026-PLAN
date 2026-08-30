import "server-only";
import { z } from "zod";
import { isValidDateOnly } from "@/lib/date-only";
import type { Subscription } from "@/lib/types";

const subscriptionSchema = z
  .object({
    id: z.string().min(1),
    user_id: z.string().min(1),
    service_name: z.string().trim().min(1),
    plan_name: z.string().trim().min(1).nullable(),
    cost: z.number().finite().nonnegative(),
    currency: z.string().trim().regex(/^[A-Z]{3}$/),
    billing_cycle: z.enum(["monthly", "yearly", "weekly"]),
    next_billing_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine(isValidDateOnly)
      .nullable(),
    category: z.enum([
      "엔터테인먼트",
      "생산성",
      "음악",
      "클라우드",
      "교육",
      "건강",
      "뉴스",
      "기타",
    ]),
    icon_url: z.string().url().nullable(),
    status: z.enum(["active", "paused", "cancelled"]),
    memo: z.string().nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  .strict();

const subscriptionsSchema = z.array(subscriptionSchema).min(1);

export function hasPrivateSubscriptions(): boolean {
  return process.env.SUBSCRIPTIONS_JSON !== undefined;
}

export function getPrivateSubscriptions(): Subscription[] {
  const raw = process.env.SUBSCRIPTIONS_JSON?.trim();
  if (!raw) {
    throw new Error("SUBSCRIPTIONS_JSON is not configured");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("SUBSCRIPTIONS_JSON must be valid JSON");
  }

  const result = subscriptionsSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("SUBSCRIPTIONS_JSON does not match the Subscription schema");
  }

  return result.data;
}
