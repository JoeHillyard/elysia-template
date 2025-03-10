import {integer, timestamp} from "drizzle-orm/pg-core";

export const baseColumns = {
	id: integer().generatedAlwaysAsIdentity().primaryKey(),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
	deletedAt: timestamp(),
};