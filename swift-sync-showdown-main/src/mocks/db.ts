export type Post = {
  id: string;
  author: string;
  content: string;
  likeCount: number;
  likedByUser: boolean;
};

const initialPosts: Post[] = [
  {
    id: "1",
    author: "Ada Lovelace",
    content: "Just shipped a new analytical engine update. Optimism > pessimism.",
    likeCount: 12,
    likedByUser: false,
  },
  {
    id: "2",
    author: "Linus Torvalds",
    content: "Talk is cheap. Show me the rollback.",
    likeCount: 47,
    likedByUser: true,
  },
  {
    id: "3",
    author: "Grace Hopper",
    content: "A ship in port is safe, but that's not what UIs are built for.",
    likeCount: 23,
    likedByUser: false,
  },
  {
    id: "4",
    author: "Margaret Hamilton",
    content: "Mission-critical UX deserves mission-critical state management.",
    likeCount: 31,
    likedByUser: false,
  },
];

export const db = {
  posts: structuredClone(initialPosts) as Post[],
  reset() {
    db.posts = structuredClone(initialPosts);
  },
  list() {
    return structuredClone(db.posts);
  },
  like(id: string) {
    const p = db.posts.find((x) => x.id === id);
    if (!p) return null;
    p.likedByUser = !p.likedByUser;
    p.likeCount += p.likedByUser ? 1 : -1;
    return structuredClone(p);
  },
  remove(id: string) {
    const i = db.posts.findIndex((x) => x.id === id);
    if (i === -1) return false;
    db.posts.splice(i, 1);
    return true;
  },
};
