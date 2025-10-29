// Test della logica temporale per conferma task passati
// Esempio: Ora corrente = 14:30

const testScenario = {
  currentTime: "14:30", // Ora corrente
  tasks: [
    { id: 1, endTime: "12:00", status: "pending" }, // PASSATO - deve essere confermato
    { id: 2, endTime: "14:00", status: "pending" }, // PASSATO - deve essere confermato  
    { id: 3, endTime: "15:00", status: "pending" }, // FUTURO - NON deve essere confermato
    { id: 4, endTime: "16:30", status: "pending" }, // FUTURO - NON deve essere confermato
    { id: 5, endTime: "13:30", status: "delayed" }, // PASSATO ma delayed - solo reset a pending
  ]
};

// Logica implementata:
function shouldConfirmTask(taskEndTime, currentTime) {
  const [taskEndH, taskEndM] = taskEndTime.split(":").map(Number);
  const [currentH, currentM] = currentTime.split(":").map(Number);
  
  const taskEndMinutes = taskEndH * 60 + taskEndM;
  const currentMinutes = currentH * 60 + currentM;
  
  return currentMinutes > taskEndMinutes;
}

// Test risultati attesi:
console.log("Task 1 (12:00):", shouldConfirmTask("12:00", "14:30")); // true - conferma
console.log("Task 2 (14:00):", shouldConfirmTask("14:00", "14:30")); // true - conferma
console.log("Task 3 (15:00):", shouldConfirmTask("15:00", "14:30")); // false - non confermare
console.log("Task 4 (16:30):", shouldConfirmTask("16:30", "14:30")); // false - non confermare

// Risultato finale reset:
// - resettedTasks: 1 (task 5 da delayed a pending)
// - confirmedTasks: 2 (task 1 e 2 confermati)
// - Task 3 e 4 rimangono pending (futuri)