import {pgTable, timestamp, varchar} from "drizzle-orm/pg-core";
import {baseColumns} from "./shared";
import {createInsertSchema, createSelectSchema} from "drizzle-typebox";
import {Static} from "elysia";

export const users = pgTable('users', {
	...baseColumns,
	firstName: varchar().notNull(),
	lastName: varchar().notNull(),
	email: varchar().notNull(),
	password: varchar().notNull(),
	dateOfBirth: timestamp(),
})

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);

export type UserSelect = Static<typeof userSelectSchema>
export type UserInsert = Static<typeof userInsertSchema>
