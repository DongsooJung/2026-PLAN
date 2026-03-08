export type BillingCycle = "monthly" | "yearly" | "weekly";
export type SubscriptionStatus = "active" | "paused" | "cancelled";
export type Category =
  | "엔터테인먼트"
  | "생산성"
  | "음악"
  | "클라우드"
  | "교육"
  | "건강"
  | "뉴스"
  | "기타";

export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  plan_name: string | null;
  cost: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_billing_date: string;
  category: Category;
  icon_url: string | null;
  status: SubscriptionStatus;
  memo: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<Subscription, "id" | "user_id" | "created_at" | "updated_at">
        >;
      };
    };
  };
}
