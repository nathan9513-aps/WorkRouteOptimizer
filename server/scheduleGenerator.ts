import { storage } from "./storage";
import type { InsertTask } from "@shared/schema";

interface TimeSlot {
  startTime: string;
  endTime: string;
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  let totalMinutes = hours * 60 + mins + minutes;
  
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
}

function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

export async function generateDailySchedule(date: string, operatorName: string): Promise<string> {
  const locations = await storage.getAllLocations();
  const workLocations = locations.filter((loc) => loc.id !== "ertsfeld");

  // Check if schedule already exists for today
  const existingSchedule = await storage.getScheduleByDate(date);
  if (existingSchedule) {
    return existingSchedule.id;
  }

  // Create new schedule
  const schedule = await storage.createSchedule({
    date,
    operatorName,
  });

  const tasks: InsertTask[] = [];
  let currentTime = "08:00";
  let currentLocation = "ertsfeld";

  const isToday = date === new Date().toISOString().split("T")[0];

  // Generate tasks until 19:00
  while (timeToMinutes(currentTime) < timeToMinutes("19:00")) {
    // Special handling for today's lunch break
    if (isToday && timeToMinutes(currentTime) < timeToMinutes("13:40") && timeToMinutes(addMinutes(currentTime, 30)) >= timeToMinutes("13:40")) {
      // We need to insert lunch break
      // First, travel to Lugano if not already there
      if (currentLocation !== "lugano") {
        const travelTime = await storage.getTravelTime(currentLocation, "lugano");
        if (travelTime) {
          const travelEndTime = addMinutes(currentTime, travelTime.durationMinutes);
          
          tasks.push({
            scheduleId: schedule.id,
            type: "travel",
            locationId: "lugano",
            startTime: currentTime,
            endTime: travelEndTime,
            status: "pending",
            description: `Spostamento a Lugano`,
          });
          
          currentTime = travelEndTime;
          currentLocation = "lugano";
        }
      }

      // Add lunch break
      tasks.push({
        scheduleId: schedule.id,
        type: "break",
        locationId: "lugano",
        startTime: "13:40",
        endTime: "14:40",
        status: "pending",
        description: "Pausa pranzo",
      });

      currentTime = "14:40";

      // After lunch, travel to Bellinzona as specified
      const travelTime = await storage.getTravelTime("lugano", "bellinzona");
      if (travelTime) {
        const travelEndTime = addMinutes(currentTime, travelTime.durationMinutes);
        
        tasks.push({
          scheduleId: schedule.id,
          type: "travel",
          locationId: "bellinzona",
          startTime: currentTime,
          endTime: travelEndTime,
          status: "pending",
          description: `Spostamento a Bellinzona`,
        });
        
        currentTime = travelEndTime;
        currentLocation = "bellinzona";
      }
    }

    // Check if we should stop
    if (timeToMinutes(currentTime) >= timeToMinutes("19:00")) {
      break;
    }

    // Pick a random destination
    const availableDestinations = workLocations.filter(
      (loc) => loc.id !== currentLocation
    );
    
    if (availableDestinations.length === 0) break;

    const nextLocation = availableDestinations[
      Math.floor(Math.random() * availableDestinations.length)
    ];

    // Get travel time
    const travelTime = await storage.getTravelTime(currentLocation, nextLocation.id);
    if (!travelTime) continue;

    const travelEndTime = addMinutes(currentTime, travelTime.durationMinutes);

    // Add travel task
    tasks.push({
      scheduleId: schedule.id,
      type: "travel",
      locationId: nextLocation.id,
      startTime: currentTime,
      endTime: travelEndTime,
      status: "pending",
      description: `Spostamento a ${nextLocation.name}`,
    });

    currentTime = travelEndTime;
    currentLocation = nextLocation.id;

    // Add work task (30-90 minutes)
    const workDuration = 30 + Math.floor(Math.random() * 60);
    const workEndTime = addMinutes(currentTime, workDuration);

    // Don't add work task if it goes past 19:00
    if (timeToMinutes(workEndTime) > timeToMinutes("19:00")) {
      break;
    }

    tasks.push({
      scheduleId: schedule.id,
      type: "work",
      locationId: currentLocation,
      startTime: currentTime,
      endTime: workEndTime,
      status: "pending",
      description: `Lavoro a ${nextLocation.name}`,
    });

    currentTime = workEndTime;
  }

  // Save all tasks
  for (const task of tasks) {
    await storage.createTask(task);
  }

  return schedule.id;
}
