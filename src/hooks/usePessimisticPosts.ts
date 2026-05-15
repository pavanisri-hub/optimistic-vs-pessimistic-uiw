import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/api/posts";
import type { Post } from "@/mocks/db";
import { toast } from "sonner";

const KEY = ["pessimistic-posts"] as const;

export function usePessimisticPosts() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: KEY,
    queryFn: ({ signal }) => postsApi.list(signal),
    staleTime: 0,
  });

  const like = useMutation({
    mutationFn: (id: string) => postsApi.like(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e) => {
      console.log("MUTATION ERROR", e);
      toast.error("Failed to like post");
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => postsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    onError: (e) => {
      console.log("MUTATION ERROR", e);
      toast.error("Failed to delete post");
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
