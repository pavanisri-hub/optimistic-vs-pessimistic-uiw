import { Loader2 } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { usePessimisticPosts } from "@/hooks/usePessimisticPosts";

export function PessimisticFeed() {
  const { posts, isLoading, like, remove } = usePessimisticPosts();
  const likingId: string | null = like.isPending ? (like.variables ?? null) : null;
  const deletingId: string | null = remove.isPending ? (remove.variables ?? null) : null;

  return (
    <section
      data-testid="pessimistic-feed"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-4"
    >
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Pessimistic Feed</h2>
          <p className="text-xs text-muted-foreground">
            Wait for server, then update UI
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 rounded bg-muted">
          await · then render
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
              isLiking={likingId === p.id}
              isDeleting={deletingId === p.id}
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
