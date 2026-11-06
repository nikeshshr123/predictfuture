import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const readings = sqliteTable("readings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entryKey: text("entry_key").notNull().unique(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  job: text("job").notNull(),
  love: text("love").notNull(),
  sign: text("sign").notNull(),
  dob: text("dob").notNull(),
  created: integer("created").notNull()
});

export const sessions = sqliteTable("admin_sessions", {
  token: text("token").primaryKey(),
  expires: integer("expires").notNull()
});

export const attempts = sqliteTable("login_attempts", {
  bucket: text("bucket").primaryKey(),
  count: integer("count").notNull(),
  expires: integer("expires").notNull()
});
