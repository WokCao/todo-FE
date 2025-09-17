import api from "./Interceptor";
import type { CreateTaskDTO, GetTasksParams, PagedDataDTO, Task } from "../interfaces/types";


// Create a new task
export const createTask = async (task: CreateTaskDTO) => {
	const res = await api.post<Task>("/tasks", task);
	return res.data;
};

// Get tasks with pagination, sorting, and filters
export const getTasks = async (params: GetTasksParams = {}) => {
	const res = await api.get<PagedDataDTO<Task>>("/tasks", { params });
	return res.data;
};

// Get a single task by ID
export const getTask = async (id: string | number) => {
	const res = await api.get<Task>(`/tasks/${id}`);
	return res.data;
};

// Update a task by ID
export const updateTask = async (id: string | number, task: CreateTaskDTO) => {
	const res = await api.put<Task>(`/tasks/${id}`, task);
	return res.data;
};

// Delete a task by ID
export const deleteTask = async (id: string | number) => {
	const res = await api.delete<{ message: string }>(`/tasks/${id}`);
	return res.data;
};
