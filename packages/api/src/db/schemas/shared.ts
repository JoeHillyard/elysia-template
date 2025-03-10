import {integer, timestamp} from "drizzle-orm/pg-core";
import {t} from "elysia";

export const baseColumns = {
	id: integer().generatedAlwaysAsIdentity().primaryKey(),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
	deletedAt: timestamp(),
};

export const baseSchema = t.Object({
	id: t.Number(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
	deletedAt: t.Date()
})