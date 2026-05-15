import type { Post } from "@/mocks/db";

async function json<T>(r: Response): Promise<T> {
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return r.json() as Promise<T>;
}

export const postsApi = {
  list: (signal?: AbortSignal) =>
    fetch("/api/posts", { signal }).then((r) => json<Post[]>(r)),
  like: (id: string) =>
    fetch(`/api/posts/${id}/like`, { method: "POST" }).then((r) => json<Post>(r)),
  remove: (id: string) =>
    fetch(`/api/posts/${id}`, { method: "DELETE" }).then((r) =>
      json<{ success: boolean }>(r),
    ),
};
