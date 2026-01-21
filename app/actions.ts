"use server";

export async function createTask(formData: any) {
  // Mock server action
  console.log("Creating task with data:", formData);
  return { success: true, taskId: "task-123" };
}
