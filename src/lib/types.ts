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

export type ExportFormat = "hwpx" | "docx" | "pdf";

export interface DocumentMetadata {
  recipient: string;
  reference: string;
  drafter: string;
  reviewer: string;
  approver: string;
  documentNumber: string;
  enforcementDate: string;
  department: string;
  contactInfo: string;
}

export interface Conversion {
  id: string;
  user_id: string;
  title: string;
  md_content: string;
  document_metadata: DocumentMetadata;
  export_format: ExportFormat | null;
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
      conversions: {
        Row: Conversion;
        Insert: Omit<Conversion, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<Conversion, "id" | "user_id" | "created_at" | "updated_at">
        >;
      };
    };
  };
}
