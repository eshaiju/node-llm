import { Middleware, MiddlewareContext } from "../types/Middleware.js";

/**
 * Helper to execute middleware chains in order.
 * @internal
 */
export async function runMiddleware(
  middlewares: Middleware[],
  hookName: keyof Middleware,
  context: MiddlewareContext,
  ...args: any[]
) {
  if (!middlewares || middlewares.length === 0) return;

  for (const middleware of middlewares) {
    if (typeof middleware[hookName] === "function") {
      // @ts-ignore
      await middleware[hookName](context, ...args);
    }
  }
}
