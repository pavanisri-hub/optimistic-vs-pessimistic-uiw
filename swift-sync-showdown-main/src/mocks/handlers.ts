import { http, HttpResponse, delay } from "msw";
import { networkConditions } from "@/config/network";
import { db } from "./db";

async function simulate() {
  await delay(networkConditions.latency);
  if (Math.random() < networkConditions.failureRate) {
    return new HttpResponse(JSON.stringify({ error: "Simulated failure" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

export const handlers = [
  http.get("/api/posts", async () => {
    const fail = await simulate();
    if (fail) return fail;
    return HttpResponse.json(db.list());
  }),

  http.post("/api/posts/:id/like", async ({ params }) => {
    const fail = await simulate();
    if (fail) return fail;
    const post = db.like(String(params.id));
    if (!post) return new HttpResponse(null, { status: 404 });
    console.log("MSW LIKE SUCCESS", post.id, post.likeCount, post.likedByUser);
    return HttpResponse.json(post);
  }),

  http.delete("/api/posts/:id", async ({ params }) => {
    const fail = await simulate();
    if (fail) return fail;
    const ok = db.remove(String(params.id));
    if (!ok) return new HttpResponse(null, { status: 404 });
    console.log("MSW DELETE SUCCESS", params.id);
    return HttpResponse.json({ success: true });
  }),
];
