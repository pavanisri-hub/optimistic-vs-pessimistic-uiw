import { Loader2 } from "lucide-react";
import { PostCard } from "../components/PostCard";
import { useOptimisticPosts } from "@/hooks/useOptimisticPosts";

export function OptimisticFeed() {
  const { posts, isLoading, like, remove } = useOptimisticPosts();

  return (
    <section
      data-testid="optimistic-feed"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-4"
    >
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Optimistic Feed</h2>
          <p className="text-xs text-muted-foreground">
            Update UI instantly, rollback on error
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-emerald-600 px-2 py-1 rounded bg-emerald-500/10">
          instant · rollback
        </span>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onLike={(id) => like.mutate(id)}
              onDelete={(id) => remove.mutate(id)}
            />
          ))}
          {posts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No posts.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
