import { authRouter } from "./auth-router.js";
import { productRouter } from "./product-router.js";
import { videoRouter } from "./video-router.js";
import { appointmentRouter } from "./appointment-router.js";
import { chatRouter } from "./chat-router.js";
import { settingsRouter } from "./settings-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  product: productRouter,
  video: videoRouter,
  appointment: appointmentRouter,
  chat: chatRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
