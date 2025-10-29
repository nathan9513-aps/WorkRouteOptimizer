import {
  type Location,
  type InsertLocation,
  type TravelTime,
  type InsertTravelTime,
  type Task,
  type InsertTask,
  type Schedule,
  type InsertSchedule,
  type TaskWithLocation,
  type ScheduleWithTasks,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Locations
  getLocation(id: string): Promise<Location | undefined>;
  getAllLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;

  // Travel Times
  getTravelTime(fromId: string, toId: string): Promise<TravelTime | undefined>;
  getAllTravelTimes(): Promise<TravelTime[]>;
  createTravelTime(travelTime: InsertTravelTime): Promise<TravelTime>;

  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getTasksForSchedule(scheduleId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;

  // Schedules
  getSchedule(id: string): Promise<Schedule | undefined>;
  getScheduleByDate(date: string): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  
  // Combined queries
  getScheduleWithTasks(scheduleId: string): Promise<ScheduleWithTasks | undefined>;
  getScheduleByDateWithTasks(date: string): Promise<ScheduleWithTasks | undefined>;
}

export class MemStorage implements IStorage {
  private locations: Map<string, Location>;
  private travelTimes: Map<string, TravelTime>;
  private tasks: Map<string, Task>;
  private schedules: Map<string, Schedule>;

  constructor() {
    this.locations = new Map();
    this.travelTimes = new Map();
    this.tasks = new Map();
    this.schedules = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize locations
    const locationData: Location[] = [
      { id: "lugano", name: "Lugano" },
      { id: "bellinzona", name: "Bellinzona" },
      { id: "giubiasco", name: "Giubiasco" },
      { id: "ertsfeld", name: "Ertsfeld" },
    ];

    locationData.forEach((loc) => this.locations.set(loc.id, loc));

    // Initialize travel times (in minutes, approximate)
    const travelTimeData: Array<{ from: string; to: string; duration: number }> = [
      // From Ertsfeld
      { from: "ertsfeld", to: "lugano", duration: 25 },
      { from: "ertsfeld", to: "bellinzona", duration: 15 },
      { from: "ertsfeld", to: "giubiasco", duration: 10 },

      // From Lugano
      { from: "lugano", to: "ertsfeld", duration: 25 },
      { from: "lugano", to: "bellinzona", duration: 35 },
      { from: "lugano", to: "giubiasco", duration: 30 },

      // From Bellinzona
      { from: "bellinzona", to: "ertsfeld", duration: 15 },
      { from: "bellinzona", to: "lugano", duration: 35 },
      { from: "bellinzona", to: "giubiasco", duration: 8 },

      // From Giubiasco
      { from: "giubiasco", to: "ertsfeld", duration: 10 },
      { from: "giubiasco", to: "lugano", duration: 30 },
      { from: "giubiasco", to: "bellinzona", duration: 8 },
    ];

    travelTimeData.forEach((tt) => {
      const id = randomUUID();
      this.travelTimes.set(id, {
        id,
        fromLocationId: tt.from,
        toLocationId: tt.to,
        durationMinutes: tt.duration,
      });
    });
  }

  // Locations
  async getLocation(id: string): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = randomUUID();
    const newLocation: Location = { ...location, id };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  // Travel Times
  async getTravelTime(fromId: string, toId: string): Promise<TravelTime | undefined> {
    return Array.from(this.travelTimes.values()).find(
      (tt) => tt.fromLocationId === fromId && tt.toLocationId === toId
    );
  }

  async getAllTravelTimes(): Promise<TravelTime[]> {
    return Array.from(this.travelTimes.values());
  }

  async createTravelTime(travelTime: InsertTravelTime): Promise<TravelTime> {
    const id = randomUUID();
    const newTravelTime: TravelTime = { ...travelTime, id };
    this.travelTimes.set(id, newTravelTime);
    return newTravelTime;
  }

  // Tasks
  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksForSchedule(scheduleId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((task) => task.scheduleId === scheduleId)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = randomUUID();
    const newTask: Task = {
      ...task,
      id,
      status: task.status || "pending",
      confirmedAt: null,
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // Schedules
  async getSchedule(id: string): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }

  async getScheduleByDate(date: string): Promise<Schedule | undefined> {
    return Array.from(this.schedules.values()).find((s) => s.date === date);
  }

  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const id = randomUUID();
    const newSchedule: Schedule = {
      ...schedule,
      id,
      generatedAt: new Date(),
    };
    this.schedules.set(id, newSchedule);
    return newSchedule;
  }

  // Combined queries
  async getScheduleWithTasks(scheduleId: string): Promise<ScheduleWithTasks | undefined> {
    const schedule = await this.getSchedule(scheduleId);
    if (!schedule) return undefined;

    const tasks = await this.getTasksForSchedule(scheduleId);
    const tasksWithLocations: TaskWithLocation[] = await Promise.all(
      tasks.map(async (task) => {
        if (task.locationId) {
          const location = await this.getLocation(task.locationId);
          return { ...task, location };
        }
        return task;
      })
    );

    return {
      ...schedule,
      tasks: tasksWithLocations,
    };
  }

  async getScheduleByDateWithTasks(date: string): Promise<ScheduleWithTasks | undefined> {
    const schedule = await this.getScheduleByDate(date);
    if (!schedule) return undefined;
    return this.getScheduleWithTasks(schedule.id);
  }
}

export const storage = new MemStorage();
