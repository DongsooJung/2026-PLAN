// Categorical chart colors are assigned in this FIXED order (never cycled).
// Palette validated for both light/dark surfaces — see globals.css --chart-1..8.
export const CATEGORIES = [
  { value: "엔터테인먼트", label: "엔터테인먼트", emoji: "🎬", color: "var(--chart-1)" },
  { value: "생산성", label: "생산성", emoji: "⚡", color: "var(--chart-2)" },
  { value: "음악", label: "음악", emoji: "🎵", color: "var(--chart-3)" },
  { value: "클라우드", label: "클라우드", emoji: "☁️", color: "var(--chart-4)" },
  { value: "교육", label: "교육", emoji: "📚", color: "var(--chart-5)" },
  { value: "건강", label: "건강", emoji: "💪", color: "var(--chart-6)" },
  { value: "뉴스", label: "뉴스", emoji: "📰", color: "var(--chart-7)" },
  { value: "기타", label: "기타", emoji: "📦", color: "var(--chart-8)" },
] as const;

export const CATEGORY_COLOR: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.color])
);

export const BILLING_CYCLES = [
  { value: "monthly", label: "월간" },
  { value: "yearly", label: "연간" },
  { value: "weekly", label: "주간" },
] as const;

export const STATUS_OPTIONS = [
  { value: "active", label: "활성", color: "bg-green-500" },
  { value: "paused", label: "일시정지", color: "bg-yellow-500" },
  { value: "cancelled", label: "해지", color: "bg-red-500" },
] as const;

export const POPULAR_SERVICES = [
  { name: "Netflix", category: "엔터테인먼트" },
  { name: "YouTube Premium", category: "엔터테인먼트" },
  { name: "Disney+", category: "엔터테인먼트" },
  { name: "Spotify", category: "음악" },
  { name: "Apple Music", category: "음악" },
  { name: "ChatGPT Plus", category: "생산성" },
  { name: "Notion", category: "생산성" },
  { name: "iCloud+", category: "클라우드" },
  { name: "Google One", category: "클라우드" },
  { name: "Microsoft 365", category: "생산성" },
] as const;
