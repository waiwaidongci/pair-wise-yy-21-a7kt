export const config = {
  port: Number(process.env.PORT ?? 3000),
  dbHost: process.env.DB_HOST ?? "localhost",
  jwtSecret: process.env.JWT_SECRET ?? "grid-repair-local-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 120)
};
