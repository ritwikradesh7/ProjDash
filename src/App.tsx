//Fetches users and projects from API and stores them in global state
//Theme toggle option with persistence in localStorage
//Passes all data down into AppLayour
import { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import AppLayout from './components/AppLayout';
import { useColorMode } from './hooks/useColorMode';
import { fetchData } from './api/api';
import type { User, Project } from './types';

export default function App() {
  //Store fetched users and projects in state and theme with persistence
  const { theme, mode, toggle } = useColorMode();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchData()
      .then(({ users, projects }) => {
        setUsers(users);
        setProjects(projects);
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout
        users={users}
        projects={projects}
        setProjects={setProjects}
        loading={loading}
        error={error}
        mode={mode}
        toggleColorMode={toggle}
      />
    </ThemeProvider>
  );
}
