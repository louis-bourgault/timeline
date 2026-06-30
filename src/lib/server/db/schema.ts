import { pgTable, integer, text, bigserial, real, boolean } from 'drizzle-orm/pg-core';

export const events = pgTable("events", {
	id: bigserial("id", { mode: 'bigint' }).primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	wikiUrl: text("wikiUrl"),
	viewPriority: integer("viewPriority").default(0),
	importance: real("importance").default(0),
	yearStart: integer('year_start').notNull(),
	monthStart: integer('month_start').default(0),
	dayStart: integer('day_start').default(0),
	yearEnd: integer('year_end'),
	monthEnd: integer('month_end').default(0),
	dayEnd: integer('day_end').default(0),
	precision: integer('precision').notNull().default(11), 
	isBce: boolean('is_bce').default(false),
	dateDisplay: text('date_display'), 
	latitude: real("latitude"),
	longitude: real("longitude"),
});

export const tags = pgTable("tags", {
	id: bigserial("id", { mode: 'bigint' }).primaryKey(),
	name: text("name").notNull(),
	color: text("color"),
	wikidataQid: text("wikidata_qid").unique(),
});

export const eventTags = pgTable("event_tags", {
	id: bigserial("id", { mode: 'bigint' }).primaryKey(),
	eventId: bigserial("event_id", { mode: 'bigint' }).references(() => events.id, { onDelete: 'cascade' }),
	tagId: bigserial("tag_id", { mode: 'bigint' }).references(() => tags.id, { onDelete: 'cascade' }),
});