import { betterAuth } from "better-auth";
import { Pool } from "pg";
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  baseURL: {
    // Allows any .vercel.app subdomain for preview deployments
    allowedHosts: [
      "your-production-domain.com",
      "*.vercel.app",
      "localhost:3000",
    ],
  },
});
