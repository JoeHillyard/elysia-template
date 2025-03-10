import {pgTable, varchar} from "drizzle-orm/pg-core";
import {baseColumns} from "./shared";

export const users = pgTable('users', {
	...baseColumns,
	firstName: varchar().notNull(),
	lastName: varchar().notNull(),
	email: varchar().notNull(),
	password: varchar().notNull(),
})