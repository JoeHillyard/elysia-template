import {pgTable, varchar} from "drizzle-orm/pg-core";
import {baseColumns} from "./shared";
import {createInsertSchema, createSelectSchema} from "drizzle-typebox";
import {Static} from "elysia";

export const users = pgTable('users', {
	...baseColumns,
	firstName: varchar().notNull(),
	lastName: varchar().notNull(),
	email: varchar().notNull(),
	password: varchar().notNull(),
})

export const userSelectSchema = createSelectSchema(users);

export type UserSelect = Static<typeof userSelectSchema>

export const userInsertSchema = createInsertSchema(users);

export type UserInsert = Static<typeof userInsertSchema>


