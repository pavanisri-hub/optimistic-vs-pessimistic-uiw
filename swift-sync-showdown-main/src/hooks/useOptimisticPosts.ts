import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flushSync } from "react-dom";
import { postsApi } from "@/api/posts";
import type { Post } from "@/mocks/db";
import { toast } from "sonner";

const KEY = ["optimistic-posts"] as const;

export function useOptimisticPosts() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: KEY,
    queryFn: ({ signal }) => postsApi.list(signal),
    staleTime: 0,
  });

  const like = useMutation({
    mutationFn: (id: string) => postsApi.like(id),
    onMutate: (id: string) => {
      void qc.cancelQueries({ queryKey: KEY }, { silent: true, revert: false });
      const previousPosts = qc.getQueryData<Post[]>(KEY);
      flushSync(() => {
        qc.setQueryData<Post[]>(KEY, (old) =>
          (old ?? []).map((p) =>
            p.id === id
              ? {
                  ...p,
                  likedByUser: !p.likedByUser,
                  likeCount: p.likeCount + (p.likedByUser ? -1 : 1),
                }
              : p,
          ),
        );
      });
      return { previousPosts };
    },
    onError: (e, _v, ctx) => {
      console.log("MUTATION ERROR", e);
      if (ctx?.previousPosts) qc.setQueryData(KEY, ctx.previousPosts);
      toast.error("Like failed — rolled back");
    },
    onSuccess: (updatedPost) => {
      qc.setQueryData<Post[]>(KEY, (old) =>
        (old ?? []).map((p) => (p.id === updatedPost.id ? updatedPost : p)),
      );
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => postsApi.remove(id),
    onMutate: (id: string) => {
      void qc.cancelQueries({ queryKey: KEY }, { silent: true, revert: false });
      const previousPosts = qc.getQueryData<Post[]>(KEY);
      qc.setQueryData<Post[]>(KEY, (old) => (old ?? []).filter((p) => p.id !== id));
      return { previousPosts };
    },
    onError: (e, _v, ctx) => {
      console.log("MUTATION ERROR", e);
      if (ctx?.previousPosts) qc.setQueryData(KEY, ctx.previousPosts);
      toast.error("Delete failed — post restored");
    },
  });

  return {
    posts: (query.data ?? []) as Post[],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    like,
    remove,
    refetch: query.refetch,
  };
}
