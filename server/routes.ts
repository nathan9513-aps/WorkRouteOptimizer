import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateDailySchedule } from "./scheduleGenerator";
import { confirmTaskSchema, reportDelaySchema, resetDelaySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get today's schedule (or generate if doesn't exist)
  app.get("/api/schedule/today", async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      let schedule = await storage.getScheduleByDateWithTasks(today);
      
      if (!schedule) {
        // Generate schedule for today
        const scheduleId = await generateDailySchedule(today, "Nathan");
        schedule = await storage.getScheduleWithTasks(scheduleId);
      }

      if (!schedule) {
        return res.status(404).json({ error: "Could not create schedule" });
      }

      return res.json(schedule);
    } catch (error) {
      console.error("Error getting today's schedule:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get schedule by date
  app.get("/api/schedule/:date", async (req, res) => {
    try {
      const { date } = req.params;
      
      let schedule = await storage.getScheduleByDateWithTasks(date);
      
      if (!schedule) {
        // Generate schedule for this date
        const scheduleId = await generateDailySchedule(date, "Nathan");
        schedule = await storage.getScheduleWithTasks(scheduleId);
      }

      if (!schedule) {
        return res.status(404).json({ error: "Could not create schedule" });
      }

      return res.json(schedule);
    } catch (error) {
      console.error("Error getting schedule:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Confirm a task
  app.post("/api/tasks/:id/confirm", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body
      const validation = confirmTaskSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Update task status to confirmed
      const updatedTask = await storage.updateTask(id, {
        status: "confirmed",
        confirmedAt: new Date(validation.data.confirmedAt),
      });

      return res.json(updatedTask);
    } catch (error) {
      console.error("Error confirming task:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Report a delay
  app.post("/api/tasks/:id/delay", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate request body
      const validation = reportDelaySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Update task status to delayed
      await storage.updateTask(id, {
        status: "delayed",
      });

      // Get all tasks for this schedule
      const tasks = await storage.getTasksForSchedule(task.scheduleId);
      
      // Find tasks that come after this one
      const taskIndex = tasks.findIndex((t) => t.id === id);
      const futureTasks = tasks.slice(taskIndex + 1);

      // Update future tasks with delay
      for (const futureTask of futureTasks) {
        const [startH, startM] = futureTask.startTime.split(":").map(Number);
        const [endH, endM] = futureTask.endTime.split(":").map(Number);
        
        const newStartMinutes = startH * 60 + startM + validation.data.delayMinutes;
        const newEndMinutes = endH * 60 + endM + validation.data.delayMinutes;
        
        const newStartTime = `${Math.floor(newStartMinutes / 60).toString().padStart(2, "0")}:${(newStartMinutes % 60).toString().padStart(2, "0")}`;
        const newEndTime = `${Math.floor(newEndMinutes / 60).toString().padStart(2, "0")}:${(newEndMinutes % 60).toString().padStart(2, "0")}`;
        
        await storage.updateTask(futureTask.id, {
          startTime: newStartTime,
          endTime: newEndTime,
        });
      }

      return res.json({
        message: "Delay recorded and schedule updated",
        delayMinutes: validation.data.delayMinutes,
        affectedTasks: futureTasks.length,
      });
    } catch (error) {
      console.error("Error reporting delay:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reset delays (admin only)
  app.post("/api/admin/reset-delays", async (req, res) => {
    try {
      // Validate request body
      const validation = resetDelaySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error });
      }

      // Check admin password (in production, use proper authentication)
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
      if (validation.data.password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Invalid admin password" });
      }

      const today = new Date().toISOString().split("T")[0];
      const schedule = await storage.getScheduleByDateWithTasks(today);
      
      if (!schedule) {
        return res.status(404).json({ error: "No schedule found for today" });
      }

      let resettedTasks = 0;
      let confirmedTasks = 0;

      // Reset all delayed tasks back to their original times and status
      for (const task of schedule.tasks) {
        if (task.status === "delayed") {
          // For this demo, we'll reset to pending status
          // In a real system, you'd restore original times from backup
          await storage.updateTask(task.id, {
            status: "pending",
          });
          resettedTasks++;
        }

        // If markAllOnTime is true, confirm all pending tasks
        if (validation.data.markAllOnTime && task.status === "pending") {
          await storage.updateTask(task.id, {
            status: "confirmed",
            confirmedAt: new Date(),
          });
          confirmedTasks++;
        }
      }

      // Regenerate the schedule to reset all times to original
      if (resettedTasks > 0) {
        // Delete current schedule and regenerate
        await storage.deleteSchedule(schedule.id);
        await generateDailySchedule(today, "Nathan");
      }

      return res.json({
        message: "Delays reset successfully",
        resettedTasks,
        confirmedTasks,
        scheduleRegenerated: resettedTasks > 0,
      });
    } catch (error) {
      console.error("Error resetting delays:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getAllLocations();
      return res.json(locations);
    } catch (error) {
      console.error("Error getting locations:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
