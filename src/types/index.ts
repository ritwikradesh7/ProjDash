// Defined the ts interfaces for User, Project and others
//Ensures the type safety across the app
export type Priority = 'high' | 'medium' | 'low';
export type Status = 'active' | 'pending' | 'completed';

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
}

//Defining shape of Project after Transformation
export interface Project {
  id: string;               // PRJ-001
  title: string;
  description: string;
  createdBy: number;        // user id
  team: number[];           // array of user ids
  priority: Priority;
  status: Status;
  progress: number;         // 0-100
  totalTasks: number;
  tasksCompleted: number;
  deadline: string;         // ISO date string
  createdAt: string;        // ISO date string
}
