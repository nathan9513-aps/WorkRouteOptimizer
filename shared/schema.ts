import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Locations table
export const locations = pgTable("locations", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
});

// Travel times between locations
export const travelTimes = pgTable("travel_times", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromLocationId: varchar("from_location_id").notNull(),
  toLocationId: varchar("to_location_id").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
});

// Tasks in a schedule
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scheduleId: varchar("schedule_id").notNull(),
  type: text("type").notNull(), // 'travel', 'work', 'break'
  locationId: varchar("location_id"),
  startTime: text("start_time").notNull(), // HH:mm format
  endTime: text("end_time").notNull(), // HH:mm format
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'missed', 'delayed'
  confirmedAt: timestamp("confirmed_at"),
  description: text("description"),
});

// Daily schedule
export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // YYYY-MM-DD format
  operatorName: text("operator_name").notNull(),
  generatedAt: timestamp("generated_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });
export const insertTravelTimeSchema = createInsertSchema(travelTimes).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, confirmedAt: true });
export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true, generatedAt: true });

// Types
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type TravelTime = typeof travelTimes.$inferSelect;
export type InsertTravelTime = z.infer<typeof insertTravelTimeSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

// Extended types for API responses
export type TaskWithLocation = Task & {
  location?: Location;
};

export type ScheduleWithTasks = Schedule & {
  tasks: TaskWithLocation[];
};

// Request/Response types
export const confirmTaskSchema = z.object({
  taskId: z.string(),
  confirmedAt: z.string().datetime(),
});

export type ConfirmTaskRequest = z.infer<typeof confirmTaskSchema>;

export const reportDelaySchema = z.object({
  taskId: z.string(),
  delayMinutes: z.number().min(1),
});

export type ReportDelayRequest = z.infer<typeof reportDelaySchema>;
