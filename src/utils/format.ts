//Utility functions for formatting dates and computing completion rates
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export const computeCompletionRate = (projects: { totalTasks: number; tasksCompleted: number; }[]) => {
  const total = projects.reduce((s, p) => s + p.totalTasks, 0);
  const completed = projects.reduce((s, p) => s + p.tasksCompleted, 0);
  return total === 0 ? 0 : Math.round((completed / total) * 100);
};
