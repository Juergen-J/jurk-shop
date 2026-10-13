import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const REDIS_URL = process.env.REDIS_URL

/**
 * Production infrastructure. Redis replaces the in-memory event bus, workflow
 * engine, cache and locking (needed so events like order emails survive
 * restarts). Enabled whenever REDIS_URL is set.
 */
const redisModules = REDIS_URL
  ? [
      {
        resolve: "@medusajs/medusa/caching",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/caching-redis",
              id: "caching-redis",
              is_default: true,
              options: { redisUrl: REDIS_URL },
            },
          ],
        },
      },
      {
        resolve: "@medusajs/medusa/event-bus-redis",
        options: { redisUrl: REDIS_URL },
      },
      {
        resolve: "@medusajs/medusa/workflow-engine-redis",
        options: { redis: { redisUrl: REDIS_URL } },
      },
      {
        resolve: "@medusajs/medusa/locking",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/locking-redis",
              id: "locking-redis",
              is_default: true,
              options: { redisUrl: REDIS_URL },
            },
          ],
        },
      },
    ]
  : []

/**
 * Product images in Cloudflare R2 (S3 compatible). The hosting disk is not
 * persistent, so uploads must not live on it. Without S3_BUCKET (local
 * development) files are stored in ./static.
 */
const fileModule = process.env.S3_BUCKET
  ? [
      {
        resolve: "@medusajs/medusa/file",
        options: {
          providers: [
            {
              resolve: "@medusajs/medusa/file-s3",
              id: "s3",
              options: {
                file_url: process.env.S3_FILE_URL,
                access_key_id: process.env.S3_ACCESS_KEY_ID,
                secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                region: process.env.S3_REGION || "auto",
                bucket: process.env.S3_BUCKET,
                endpoint: process.env.S3_ENDPOINT,
              },
            },
          ],
        },
      },
    ]
  : []

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    // Production cookies are Secure/SameSite=None and are rejected on plain
    // http://localhost. Only the local Docker stack sets COOKIE_INSECURE.
    cookieOptions:
      process.env.COOKIE_INSECURE === "true"
        ? { sameSite: "lax", secure: false }
        : undefined,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  admin: {
    // Product photos straight from the camera are larger than the 1 MB default.
    maxUploadFileSize: 10 * 1024 * 1024,
  },
  modules: [
    ...redisModules,
    ...fileModule,
    {
      resolve: "@medusajs/medusa/translation",
    },
    {
      resolve: "./src/modules/withdrawal",
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/smtp-notification",
            id: "smtp",
            options: {
              channels: ["email"],
              resend_api_key: process.env.RESEND_API_KEY,
              reply_to: process.env.EMAIL_REPLY_TO,
              host: process.env.SMTP_HOST,
              port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
              // Railway may keep quotes typed around the value.
              from:
                process.env.EMAIL_FROM?.replace(/^["']|["']$/g, "") ||
                "JURK.PRO Shop <info@jurk.pro>",
            },
          },
        ],
      },
    },
  ],
  featureFlags: {
    translation: true,
  },
})
