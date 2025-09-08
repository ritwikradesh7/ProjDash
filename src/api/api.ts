//Does the api fetching from jsonplaceholder and transforms the posts to our requirement
import type { User, Project, Priority, Status } from '../types';

interface PostRaw { userId: number; id: number; title: string; body: string; }
interface UserRaw { id: number; name: string; username: string; email: string; }

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickRandomUsers = (users: User[], n: number) => {
  const copy = [...users];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n).map(u => u.id);
};

const priorities: Priority[] = ['high','medium','low'];
const statuses: Status[] = ['active','pending','completed'];

// Fetching users from /users and posts from /posts
export async function fetchData(): Promise<{ users: User[]; projects: Project[] }> {
  const [usersRes, postsRes] = await Promise.all([
    fetch('https://jsonplaceholder.typicode.com/users'),
    fetch('https://jsonplaceholder.typicode.com/posts')
  ]);

  if (!usersRes.ok || !postsRes.ok) {
    throw new Error('Failed to fetch data from JSONPlaceholder');
  }

  const usersRaw = (await usersRes.json()) as UserRaw[];
  const posts = (await postsRes.json()) as PostRaw[];

  const users: User[] = usersRaw.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    avatarUrl: `https://i.pravatar.cc/150?img=${(u.id % 70) + 1}`
  }));

  const projects: Project[] = posts.map(post => {
    const nTeam = randomInt(2, 5);
    const team = pickRandomUsers(users, nTeam);
    const progress = randomInt(0, 100);
    const totalTasks = 20;
    const tasksCompleted = Math.round((progress / 100) * totalTasks);
    const daysAhead = randomInt(10, 120);
    const deadline = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();
    const priority = priorities[randomInt(0, priorities.length - 1)];
    const status = statuses[randomInt(0, statuses.length - 1)];

    return {
      id: `PRJ-${String(post.id).padStart(3, '0')}`,
      title: post.title.slice(0, 60),
      description: post.body,
      createdBy: post.userId,
      team,
      priority,
      status,
      progress,
      totalTasks,
      tasksCompleted,
      deadline,
      createdAt: new Date().toISOString()
    } as Project;
  });

  return { users, projects };
}
