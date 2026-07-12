"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Subscription } from "@/lib/types";
import { PANELS } from "./panels";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
} from "lucide-react";

interface RotatingDashboardProps {
  subscriptions: Subscription[];
  intervalMs?: number;
}

const TICK = 100;

export function RotatingDashboard({
  subscriptions,
  intervalMs = 15000,
}: RotatingDashboardProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const count = PANELS.length;
  const active = playing && visible;

  const goTo = useCallback(
    (target: number) => {
      setIndex(((target % count) + count) % count);
      setProgress(0);
    },
    [count]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // 15초 자동 순환 타이머
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const np = p + TICK / intervalMs;
        if (np >= 1) {
          setIndex((i) => (i + 1) % count);
          return 0;
        }
        return np;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [active, index, count, intervalMs]);

  // 탭이 백그라운드로 가면 순환 정지 (재생 상태는 유지)
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // 키보드 조작: ←/→ 이동, Space 재생/정지
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // 전체화면 상태 동기화
  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      rootRef.current?.requestFullscreen().catch(() => {});
    }
  }, []);

  const panel = PANELS[index];

  return (
    <div
      ref={rootRef}
      className="flex flex-col gap-4 rounded-2xl border bg-[var(--background)] p-4 sm:p-6"
    >
      {/* 진행바 */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            width: `${Math.round(progress * 100)}%`,
            transition: active ? `width ${TICK}ms linear` : "none",
          }}
        />
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {panel.icon}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold leading-tight">
              {panel.title}
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {panel.subtitle}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" onClick={prev} aria-label="이전">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "일시정지" : "재생"}
          >
            {playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={next} aria-label="다음">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "전체화면 종료" : "전체화면"}
          >
            {fullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* 패널 본문 */}
      <div
        key={panel.id}
        className="kiosk-fade min-h-[300px] flex-1 sm:min-h-[360px]"
      >
        {panel.render(subscriptions)}
      </div>

      {/* 점 인디케이터 */}
      <div className="flex items-center justify-center gap-2 pt-1">
        {PANELS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => goTo(i)}
            aria-label={`${p.title}로 이동`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index
                ? "w-6 bg-primary"
                : "w-2 bg-[var(--muted-foreground)]/40 hover:bg-[var(--muted-foreground)]/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
