import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ControlPanel } from "@/features/ControlPanel";
import { PessimisticFeed } from "@/features/PessimisticFeed";
import { OptimisticFeed } from "@/features/OptimisticFeed";
import { setNetworkConditions } from "@/config/network";
import { db } from "@/mocks/db";

declare global {
  interface Window {
    testHarness: {
      setNetworkConditions: (patch: { latency?: number; failureRate?: number }) => void;
      getPostState: (feed: "pessimistic" | "optimistic", postId: string) =>
        | { likeCount: number; likedByUser: boolean; isVisible: boolean }
        | undefined;
      clickButton: (
        feed: "pessimistic" | "optimistic",
        postId: string,
        buttonType: "like" | "delete",
      ) => boolean | undefined;
      resetFeed: () => boolean | undefined;
    };
  }
}

export const Route = createFileRoute("/")({
  component: Index,
});

function useMswReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    import("@/mocks/browser").then(({ startWorker }) =>
      startWorker().then(() => !cancelled && setReady(true)),
    );
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}

function Index() {
  const qc = useQueryClient();
  const ready = useMswReady();

  useEffect(() => {
    const safe = <T extends (...args: any[]) => any>(fn: T) =>
      ((...args: Parameters<T>) => {
        try {
          return fn(...args);
        } catch (err) {
          console.error("TEST_HARNESS_CALL_FAILED", err);
          return undefined;
        }
      }) as T;

    const getQueryKey = (feed: "pessimistic" | "optimistic") =>
      feed === "pessimistic" ? ["pessimistic-posts"] : ["optimistic-posts"];

    const getPostState = safe((feed: "pessimistic" | "optimistic", postId: string) => {
      const posts = (qc.getQueryData<any[]>(getQueryKey(feed)) ?? []) as any[];
      const post = posts.find((item) => item.id === postId);

      return {
        likeCount: post?.likeCount ?? 0,
        likedByUser: post?.likedByUser ?? false,
        isVisible: Boolean(post),
      };
    });

    const clickButton = safe(
      (feed: "pessimistic" | "optimistic", postId: string, buttonType: "like" | "delete") => {
        const feedElement = document.querySelector(`[data-testid="${feed}-feed"]`);
        const postElement = feedElement?.querySelector(`[data-testid="post-${postId}"]`);
        const button = postElement?.querySelector(
          `[data-testid="${buttonType}-button"]`,
        ) as HTMLButtonElement | null | undefined;

        button?.click();
        return Boolean(button);
      },
    );

    const resetFeed = safe(() => {
      db.reset();
      qc.setQueryData(["pessimistic-posts"], db.list());
      qc.setQueryData(["optimistic-posts"], db.list());
      return true;
    });

    window.testHarness = {
      setNetworkConditions: safe(setNetworkConditions),
      getPostState,
      clickButton,
      resetFeed,
    };

    console.log("TEST_HARNESS_READY", window.testHarness);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" richColors />
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Optimistic vs Pessimistic UI
            </h1>
            <p className="text-xs text-muted-foreground">
              React Query · MSW · side-by-side benchmark
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {ready ? "mock api online" : "booting…"}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
        <ControlPanel />
        {!ready ? (
          <div className="text-center text-muted-foreground py-20 text-sm">
            Initializing mock service worker…
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PessimisticFeed />
            <OptimisticFeed />
          </div>
        )}
      </main>
    </div>
  );
}
