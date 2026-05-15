import type { QueryClient } from "@tanstack/react-query";
import { setNetworkConditions } from "@/config/network";
import { db } from "@/mocks/db";

type FeedType = "pessimistic" | "optimistic";

const keyFor = (f: FeedType) =>
  f === "pessimistic" ? ["pessimistic-posts"] : ["optimistic-posts"];

export function installTestHarness(qc: QueryClient) {
  if (typeof window === "undefined") return;

  const safe = <T extends (...args: any[]) => any>(fn: T) =>
    ((...args: Parameters<T>) => {
      try {
        return fn(...args);
      } catch (err) {
        console.error("TEST_HARNESS_CALL_FAILED", err);
        return undefined;
      }
    }) as T;

  const getPostState = safe((feed: FeedType, postId: string) => {
    const data = (qc.getQueryData<any[]>(keyFor(feed)) ?? []) as any[];
    const p = data.find((x) => x.id === postId);
    return {
      likeCount: p?.likeCount ?? 0,
      likedByUser: p?.likedByUser ?? false,
      isVisible: !!p,
    };
  });

  const clickButton = safe(
    (feed: FeedType, postId: string, buttonType: "like" | "delete") => {
      if (typeof document === "undefined") return false;
      const root = document.querySelector(`[data-testid="${feed}-feed"]`);
      if (!root) return false;
      const card = root.querySelector(`[data-testid="post-${postId}"]`);
      if (!card) return false;
      const btn = card.querySelector(
        `[data-testid="${buttonType}-button"]`,
      ) as HTMLButtonElement | null;
      if (!btn) return false;
      btn.click();
      return true;
    },
  );

  const resetFeed = safe(() => {
    db.reset();
    qc.invalidateQueries({ queryKey: ["pessimistic-posts"] });
    qc.invalidateQueries({ queryKey: ["optimistic-posts"] });
    return true;
  });

  (window as any).testHarness = {
    setNetworkConditions: safe(setNetworkConditions),
    getPostState,
    clickButton,
    resetFeed,
  };

  console.log("TEST HARNESS INSTALLED");
}
