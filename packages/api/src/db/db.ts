import postgres from 'postgres';
import {drizzle} from 'drizzle-orm/postgres-js';
import * as schema from './schemas';  // your schema file

const queryClient = postgres(import.meta.env.DATABASE_URL!);

export const db = drizzle({client: queryClient, casing: 'snake_case', schema});