import { Heart, Loader2, Trash2 } from "lucide-react";
import type { Post } from "@/mocks/db";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  post: Post;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  isLiking?: boolean;
  isDeleting?: boolean;
  disableActions?: boolean;
};

export function PostCard({
  post,
  onLike,
  onDelete,
  isLiking,
  isDeleting,
  disableActions,
}: Props) {
  return (
    <Card
      data-testid={`post-${post.id}`}
      className={cn(
        "p-4 flex flex-col gap-3 transition-all border-border/60",
        isDeleting && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm text-foreground">{post.author}</p>
          <p className="text-sm text-muted-foreground mt-1">{post.content}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <Button
          data-testid="like-button"
          variant="ghost"
          size="sm"
          disabled={disableActions || isLiking}
          onClick={() => onLike(post.id)}
          className={cn(
            "gap-2 h-8",
            post.likedByUser && "text-rose-500 hover:text-rose-600",
          )}
        >
          {isLiking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart
              className={cn("h-4 w-4", post.likedByUser && "fill-current")}
            />
          )}
          <span data-testid="like-count" className="tabular-nums">
            {post.likeCount}
          </span>
        </Button>
        <Button
          data-testid="delete-button"
          variant="ghost"
          size="sm"
          disabled={disableActions || isDeleting}
          onClick={() => onDelete(post.id)}
          className="gap-2 h-8 text-muted-foreground hover:text-destructive"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}
