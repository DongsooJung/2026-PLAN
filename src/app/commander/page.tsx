import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "STARGATE COMMANDER · CEO Situation Room",
  description: "CEO 전용 매출·방문자·프로젝트·리스크 통합 상황판",
  robots: { index: false, follow: false, nocache: true },
};

type PmoSnapshot = {
  generatedAt?: string;
  summary?: {
    notionProjects?: number;
    activeProjects?: number;
    completedProjects?: number;
    averageProgress?: number;
  };
  sources?: {
    notion?: {
      status?: string;
      message?: string;
      lastSuccessfulSync?: string | null;
    };
  };
  projects?: Array<{
    id?: string;
    title?: string;
    status?: string;
    progress?: number;
    nextAction?: string;
  }>;
};

type CounterPayload = { count?: number };

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function kstDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("ko-KR").format(value);
}

function kstTimestamp() {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date());
}

export default async function CommanderPage() {
  const todayKey = kstDateKey();
  const counterBase = "https://api.counterapi.dev/v1/stargateedu-co-kr";

  const [pmo, todayCounter, totalCounter] = await Promise.all([
    fetchJson<PmoSnapshot>("https://www.stargateedu.co.kr/pmo/data/latest.json"),
    fetchJson<CounterPayload>(`${counterBase}/daily-${todayKey}`),
    fetchJson<CounterPayload>(`${counterBase}/total-visitors`),
  ]);

  const revenueRaw = process.env.COMMANDER_REVENUE_KRW;
  const revenue = revenueRaw && Number.isFinite(Number(revenueRaw))
    ? Number(revenueRaw)
    : null;
  const revenueLabel = process.env.COMMANDER_REVENUE_LABEL || "당월 누적 매출";

  const activeProjects = pmo?.summary?.activeProjects ?? null;
  const averageProgress = pmo?.summary?.averageProgress ?? null;
  const notionState = pmo?.sources?.notion?.status || "unavailable";

  const risks = [
    { score: 12, level: "긴급", label: "결제 연동 지연", action: "결제·배포 연결을 최우선으로 처리" },
    { score: 8, level: "관리", label: "콘텐츠 발행 누락", action: "발행 체크리스트와 담당 상태 확인" },
    { score: 6, level: "관리", label: "프로젝트 과다 분산", action: "이번 주 신규 대시보드 추가 억제" },
    { score: 3, level: "수용", label: "디자인 불일치", action: "핵심 기능 완료 후 일괄 정리" },
  ];

  const topRisk = risks[0];

  return (
    <main className="min-h-screen bg-[#071126] text-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <header className="mb-7 flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 font-mono text-xs font-bold tracking-[0.18em] text-cyan-300">
              STARGATE COMMANDER · CEO ONLY
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">
              CEO Situation Room
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">
              매출 · 방문자 · 프로젝트 · 리스크를 한 화면에서 확인하는 비공개 상황판입니다.
              이 경로는 서버 인증을 통과한 요청에만 응답합니다.
            </p>
          </div>
          <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300">
            PRIVATE · NOINDEX · SERVER AUTH
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="CEO 핵심 지표">
          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <div className="text-xs font-bold text-slate-400">REVENUE</div>
            <div className="mt-3 text-3xl font-black text-amber-300">
              {revenue === null ? "연결 대기" : formatKrw(revenue)}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {revenue === null
                ? "COMMANDER_REVENUE_KRW 환경변수 미설정"
                : revenueLabel}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <div className="text-xs font-bold text-slate-400">VISITORS · TODAY</div>
            <div className="mt-3 text-3xl font-black text-cyan-300">
              {formatNumber(todayCounter?.count)}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              누적 {formatNumber(totalCounter?.count)} · {todayKey} KST
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <div className="text-xs font-bold text-slate-400">ACTIVE PROJECTS</div>
            <div className="mt-3 text-3xl font-black text-violet-300">
              {formatNumber(activeProjects)}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              평균 진행률 {typeof averageProgress === "number" && Number.isFinite(averageProgress) ? `${averageProgress}%` : "—"} · Notion {notionState}
            </div>
          </article>

          <article className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-5">
            <div className="text-xs font-bold text-rose-300">TOP RISK</div>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-3xl font-black text-rose-300">{topRisk.score}</span>
              <span className="pb-1 text-sm font-bold text-rose-200">{topRisk.level}</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">{topRisk.label}</div>
          </article>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black">Project Command</h2>
                <p className="mt-1 text-xs text-slate-500">Notion PMO 최신 스냅샷</p>
              </div>
              <a
                href="https://www.stargateedu.co.kr/pmo/"
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:border-cyan-300/40 hover:text-cyan-200"
              >
                PMO 열기 ↗
              </a>
            </div>

            <div className="space-y-3">
              {(pmo?.projects || []).slice(0, 6).map((project, index) => {
                const progress = Number.isFinite(project.progress)
                  ? Math.max(0, Math.min(100, Number(project.progress)))
                  : 0;
                return (
                  <div key={project.id || index} className="rounded-xl border border-white/8 bg-black/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-sm">{project.title || "제목 없음"}</strong>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold text-slate-400">
                        {project.status || "미분류"}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                      <div className="h-full rounded-full bg-cyan-400" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-slate-500">
                      <span>{progress}%</span>
                      <span>{project.nextAction ? `NEXT · ${project.nextAction}` : "다음 행동 미설정"}</span>
                    </div>
                  </div>
                );
              })}
              {!pmo?.projects?.length && (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
                  PMO 데이터를 불러오지 못했습니다.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-black">Risk Radar</h2>
              <p className="mt-1 text-xs text-slate-500">확률 × 영향도 기준 운영 리스크</p>
            </div>
            <div className="space-y-3">
              {risks.map((risk) => (
                <div key={risk.label} className="rounded-xl border border-white/8 bg-black/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm">{risk.label}</strong>
                    <span className="font-mono text-sm font-black text-rose-300">{risk.score}</span>
                  </div>
                  <div className="mt-2 text-[11px] leading-5 text-slate-500">{risk.action}</div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-4">
          <a href="https://www.stargateedu.co.kr/strategy/" className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-bold hover:border-cyan-300/40">전략 대시보드 ↗</a>
          <a href="https://www.stargateedu.co.kr/research/" className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-bold hover:border-cyan-300/40">사일로 연구 ↗</a>
          <a href="https://www.stargateedu.co.kr/lab/" className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-bold hover:border-cyan-300/40">실험실 ↗</a>
          <a href="https://www.stargateedu.co.kr/" className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-bold hover:border-cyan-300/40">메인 홈 ↗</a>
        </section>

        <footer className="mt-8 border-t border-white/10 pt-5 text-xs text-slate-600">
          Updated {kstTimestamp()} · Revenue is shown only when configured server-side.
        </footer>
      </div>
    </main>
  );
}
