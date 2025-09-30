import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

const requiredEnvVars = ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB'];
const missingVars = requiredEnvVars.filter((varName) => !env[varName]);

if (missingVars.length > 0) {
	throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const host = env.POSTGRES_HOST || 'pickems-db';
const port = env.POSTGRES_PORT || '5432';

const connectionString = `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${host}:${port}/${env.POSTGRES_DB}`;

const client = postgres(connectionString);

export const db = drizzle(client, { schema, logger: dev });
