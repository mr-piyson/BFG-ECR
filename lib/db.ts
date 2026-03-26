// import { neon } from '@neondatabase/serverless'

// const sql = neon(process.env.DATABASE_URL!)
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// export default sql

import {
  ECRFlowStatus,
  ECRSource,
  ECRStatus,
  PrismaClient,
  StageType,
  UserRole,
} from '@prisma/client';

const prismaClientSingleton = () => {
  // 1. Setup the standard Node-Postgres driver
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  // 2. Wrap it in the Prisma Adapter
  const adapter = new PrismaPg(pool as any);

  // 3. Pass the adapter to the PrismaClient
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

/**
 * A wrapper that acts like the Neon 'sql' function
 * but uses Prisma's internal engine.
 */
export const sql = prisma.$queryRaw.bind(prisma);

export default sql;
