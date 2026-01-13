import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "1234",
  database: "documentero",
});

export const db = drizzle(pool, { schema });
