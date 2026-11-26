import {
  boolean,
  date,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  budget: integer("budget").notNull(),
  // Calendar date (Europe/Rome) on which the morning cron runs the draw.
  drawDate: date("draw_date", { mode: "string" }).notNull(),
  adminToken: text("admin_token").notNull().unique(),
  organiserEmail: text("organiser_email").notNull(),
  // The organiser can opt in to seeing who drew whom; off by default.
  showMatches: boolean("show_matches").notNull().default(false),
  drawnAt: timestamp("drawn_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const participants = pgTable(
  "participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // Stored lowercased so the per-group uniqueness check is case-insensitive.
    email: text("email").notNull(),
    giftIdeas: text("gift_ideas").notNull().default(""),
    token: text("token").notNull().unique(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    recipientId: uuid("recipient_id").references((): AnyPgColumn => participants.id),
    // Set once the draw email has been sent, so failed sends are retried by the cron.
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("participants_group_email").on(t.groupId, t.email)],
);

export type Group = typeof groups.$inferSelect;
export type Participant = typeof participants.$inferSelect;
