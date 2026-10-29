import {
	boolean,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
	id: serial("id").primaryKey(),
	title: text().notNull(),
	completed: boolean().notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const counter = pgTable("counter", {
	id: serial("id").primaryKey(),
	count: integer("count").notNull().default(0),
});
