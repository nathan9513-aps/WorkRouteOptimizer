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

      // Update task status to delayed - NON modificare orari
      await storage.updateTask(id, {
        status: "delayed",
      });

      return res.json({
        message: "Delay recorded",
        delayMinutes: validation.data.delayMinutes,
        taskId: id,
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

      // Reset all delayed tasks back to pending status - NON rigenerare schedule
      for (const task of schedule.tasks) {
        if (task.status === "delayed") {
          // Cambia solo status da delayed a pending
          await storage.updateTask(task.id, {
            status: "pending",
          });
          resettedTasks++;
        }

        // If markAllOnTime is true, confirm only PAST tasks (not all pending)
        if (validation.data.markAllOnTime && task.status === "pending") {
          // Controlla se il task è nel passato
          const now = new Date();
          const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
          
          // Converte orari in minuti per confronto
          const [taskEndH, taskEndM] = task.endTime.split(":").map(Number);
          const [currentH, currentM] = currentTime.split(":").map(Number);
          
          const taskEndMinutes = taskEndH * 60 + taskEndM;
          const currentMinutes = currentH * 60 + currentM;
          
          // Conferma solo se il task è già finito (nel passato)
          if (currentMinutes > taskEndMinutes) {
            await storage.updateTask(task.id, {
              status: "confirmed",
              confirmedAt: new Date(),
            });
            confirmedTasks++;
          }
        }
      }

      // NON rigenerare schedule - mantieni orari originali
      
      return res.json({
        message: "Delays reset successfully",
        resettedTasks,
        confirmedTasks,
        confirmedTasksNote: "Only past tasks were confirmed",
        scheduleRegenerated: false,
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
