// Prisma v7 Configuration
// Connection URLs are now managed here, not in schema.prisma
// See: https://pris.ly/d/config-datasource

import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  // Schema location
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),

  // Datasource configuration (for migrations/introspection)
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
