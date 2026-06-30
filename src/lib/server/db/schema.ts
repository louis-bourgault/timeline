import { pgTable, integer, text, bigserial, real, date, boolean } from 'drizzle-orm/pg-core';

export const events = pgTable("events", {
	id: bigserial("id", {mode:'bigint'}).primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	wikiUrl: text("wikiUrl"), //a wikipedia link
	viewPriority: integer("viewPriority").default(0),
	importance: real("importance").default(0),
	tagIds: integer("tagIds").array().default([]),
	dateStart: date('date_start', { mode: 'date' }).notNull(),
    dateEnd: date('date_end', { mode: 'date' }),
	precision: text('precision', { 
		enum: ['second', 'minute', 'hour', 'day', 'month', 'year', 'decade', 'century', 'millennium', 'era'] 
	}).notNull().default('day'),
	isBce: boolean('is_bce').default(false),
	dateDisplay: text('date_display'),
})

export const tags = pgTable("tags", {
	id: bigserial("id", {mode:'bigint'}).primaryKey(),
	name: text("name").notNull(),
	color: text("color"),
}); //there are thousands of tags, we'll need an api for them all