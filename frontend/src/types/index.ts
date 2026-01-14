export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  hasPin?: boolean; // Indicates if user has set a PIN
}

export interface SetupPinRequest {
  pin: string;
  confirmPin: string;
}

export interface VerifyPinRequest {
  pin: string;
}

export interface ChangePinRequest {
  currentPin: string;
  newPin: string;
  confirmPin: string;
}

export interface UserPreferences {
  autoTransferOverdueTasks: boolean;
  defaultTaskDate: 'none' | 'today' | 'tomorrow';
  firstDayOfWeek: 'default' | 'monday' | 'sunday' | 'saturday';
  enableNotificationReminders: boolean;
  theme: 'default' | 'light' | 'dark';
}

export interface UpdateUserPreferencesRequest {
  autoTransferOverdueTasks: boolean;
  defaultTaskDate?: 'none' | 'today' | 'tomorrow';
  firstDayOfWeek?: 'default' | 'monday' | 'sunday' | 'saturday';
  enableNotificationReminders?: boolean;
  theme?: 'default' | 'light' | 'dark';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  isCompleted: boolean;
  isImportant: boolean;
  startDate?: string;
  dueDate?: string;
  executionTime?: string;
  recurrencePattern?: string;
  nextOccurrence?: string;
  audioUrl?: string;
  imageUrl?: string;
  subTasks: SubTask[];
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: number;
  title: string;
  isCompleted: boolean;
  order: number;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  icon?: string;
}

export interface Reminder {
  id: number;
  todoId?: number;
  todoTitle?: string;
  title: string;
  description?: string;
  reminderTime: string;
  isCompleted: boolean;
  isSnoozed: boolean;
  snoozeUntil?: string;
  recurrencePattern?: string;
  nextReminderTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
  categoryId?: number;
  isImportant?: boolean;
  startDate?: string;
  dueDate?: string;
  executionTime?: string;
  recurrencePattern?: string;
  audioUrl?: string;
  imageUrl?: string;
  subTasks?: CreateSubTaskRequest[];
}

export interface CreateSubTaskRequest {
  title: string;
  order: number;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  categoryId?: number;
  isCompleted?: boolean;
  isImportant?: boolean;
  startDate?: string;
  dueDate?: string;
  executionTime?: string;
  recurrencePattern?: string;
  audioUrl?: string;
  imageUrl?: string;
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  icon?: string;
}

export interface CreateReminderRequest {
  todoId?: number;
  title: string;
  description?: string;
  reminderTime: string;
  recurrencePattern?: string;
}

export interface UpdateReminderRequest {
  title?: string;
  description?: string;
  reminderTime?: string;
  isCompleted?: boolean;
  isSnoozed?: boolean;
  snoozeUntil?: string;
  recurrencePattern?: string;
}

