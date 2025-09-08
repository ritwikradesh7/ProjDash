//Main app layout, Display header, stats, filters, table, new project dialog
import React, { useMemo, useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Avatar,
  Container, Paper, TextField, MenuItem, Chip, Table, TableHead,
  TableRow, TableCell, TableBody, LinearProgress, Drawer, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete,
  Pagination as MuiPagination, Stack,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import type { User, Project, Priority, Status } from '../types';
import { formatDate, computeCompletionRate } from '../utils/format';

type Props = {
  users: User[];
  projects: Project[];
  setProjects: (p: Project[]) => void;
  loading: boolean;
  error: string | null;
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
};

export default function AppLayout({ users, projects, setProjects, mode, toggleColorMode }: Props) {
  // state for filters & pagination
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // State for drawer + selection
  const [selected, setSelected] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // State for new project dialog
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newTeam, setNewTeam] = useState<User[]>([]);
  const [newDeadline, setNewDeadline] = useState<Date | null>(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));

  // Deriving metrics for stats cards
  const activeCount = projects.filter(p => p.status === 'active').length;
  const totalTasks = projects.reduce((s, p) => s + p.totalTasks, 0);
  const teamUniqueCount = new Set(projects.flatMap(p => p.team)).size;
  const completionRate = computeCompletionRate(projects);

  // filtering logic for search, priority, status
  // useMemo to avoid unnecessary recalculations
  // filtered is the final array after applying all filters
  // pageData is the slice of filtered for current page
  // pageCount is total number of pages
  // pageStart is the starting index for current page
  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    let res = projects.filter(p =>
      p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
    if (priorityFilter !== 'all') res = res.filter(r => r.priority === priorityFilter);
    if (statusFilter !== 'all') res = res.filter(r => r.status === statusFilter);
    return res;
  }, [projects, searchText, priorityFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageData = filtered.slice(pageStart, pageStart + pageSize);

  // Drawer handlers
  const openDrawer = (p: Project) => {
    setSelected(p);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelected(null);
  };

  // Adding new project handler
  const handleAddProject = () => {
    if (!newTitle.trim() || !newDeadline) return;
    const nextIdNum = projects.length + 1;
    const newProject: Project = {
      id: `PRJ-${String(nextIdNum).padStart(3, '0')}`,
      title: newTitle,
      description: newDesc,
      createdBy: users[0]?.id ?? 1,
      team: newTeam.map(u => u.id),
      priority: newPriority,
      status: 'active',
      progress: 0,
      totalTasks: 20,
      tasksCompleted: 0,
      deadline: newDeadline.toISOString(),
      createdAt: new Date().toISOString()
    };
    setProjects([newProject, ...projects]);
    setNewOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewTeam([]);
    setNewDeadline(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', color: 'text.primary' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* header with logo, app name, theme toggle and profile button */}
        <AppBar position="static" elevation={1} sx={{ mb: 3, bgcolor: 'background.paper', color: 'text.primary' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48, height: 48, bgcolor: 'primary.main', color: 'common.white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 1, fontWeight: 700
              }}>PD</Box>
              <Typography variant="h5" fontWeight={700}>ProjDash</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Theme toggle button */}
              <IconButton onClick={toggleColorMode} aria-label="toggle theme" color="inherit">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              {/* Profile button */}
              <IconButton onClick={() => alert('Profile to be Displayed Soon!')}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>DP</Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* top stats (4 stats cards) */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption">ACTIVE PROJECTS</Typography>
            <Typography variant="h4" fontWeight={700}>{activeCount}</Typography>
            <Typography variant="body2" color="success.main">↑ 12% from last month</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption">TOTAL TASKS</Typography>
            <Typography variant="h4" fontWeight={700}>{totalTasks}</Typography>
            <Typography variant="body2" color="success.main">↑ 8% from last month</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption">TEAM MEMBERS</Typography>
            <Typography variant="h4" fontWeight={700}>{teamUniqueCount}</Typography>
            <Typography variant="body2">→ No change</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="caption">COMPLETION RATE</Typography>
            <Typography variant="h4" fontWeight={700}>{completionRate}%</Typography>
            <Typography variant="body2" color="success.main">↑ 5% from last month</Typography>
          </Paper>
        </Stack>

        {/* controls - Search, filters and new project button */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            sx={{ flex: 1 }}
            placeholder="Search projects by name or ID..."
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
          />
          <TextField
            select
            sx={{ flex: 1 }}
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value as any); setPage(1); }}
          >
            <MenuItem value="all">All Priorities</MenuItem>
            <MenuItem value="high"><Chip label="High" size="small" sx={{ bgcolor: '#ff7675', color: '#fff' }} /></MenuItem>
            <MenuItem value="medium"><Chip label="Medium" size="small" sx={{ bgcolor: '#ffeaa7' }} /></MenuItem>
            <MenuItem value="low"><Chip label="Low" size="small" sx={{ bgcolor: '#74b9ff' }} /></MenuItem>
          </TextField>
          {/* Status filter */}
          <TextField
            select
            sx={{ flex: 1 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </TextField>
          {/* New project button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewOpen(true)}
            sx={{ height: '56px', alignSelf: 'stretch', whiteSpace: 'nowrap' }}
          >
            New Project
          </Button>
        </Stack>

        {/* table with project info */}
        <Paper sx={{ bgcolor: 'background.paper' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PROJECT</TableCell>
                <TableCell>TEAM</TableCell>
                <TableCell>PRIORITY</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>PROGRESS</TableCell>
                <TableCell>DEADLINE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageData.map(p => (
                // Each row is clickable to open drawer with project details
                <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => openDrawer(p)}>
                  <TableCell>
                    <Typography fontWeight={700}>{p.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.id}</Typography>
                  </TableCell>
                  <TableCell>
                    {/* Avatars of team members */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {p.team.slice(0, 4).map(uid => {
                        const u = users.find(x => x.id === uid);
                        return <Avatar key={uid} alt={u?.name} src={u?.avatarUrl} sx={{ width: 32, height: 32 }} />;
                      })}
                      {p.team.length > 4 && <Chip label={`+${p.team.length - 4}`} size="small" />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={p.priority.toUpperCase()} size="small" sx={{
                      bgcolor: p.priority === 'high' ? '#ff7675' :
                               p.priority === 'medium' ? '#ffeaa7' : '#74b9ff',
                      color: '#000'
                    }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={p.status} size="small"
                          color={p.status === 'active' ? 'success' :
                                 p.status === 'completed' ? 'primary' : 'warning'} />
                  </TableCell>
                  <TableCell>
                    {/*Progress bar with percentage*/}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 160 }}>
                        <LinearProgress variant="determinate" value={p.progress} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                      <Typography variant="body2">{p.progress}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography>{formatDate(p.deadline)}</Typography>
                  </TableCell>
                </TableRow>
              ))}

              {pageData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* pagination */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Showing {Math.min(filtered.length === 0 ? 0 : pageStart + 1, filtered.length)} - {Math.min(pageStart + pageSize, filtered.length)} of {filtered.length} projects
          </Typography>
          <MuiPagination count={pageCount} page={page} onChange={handlePageChange} />
        </Stack>

        {/* drawer with project details */}
        <Drawer anchor="right" open={drawerOpen} onClose={closeDrawer}>
          <Box sx={{ width: 420, p: 3, bgcolor: 'background.paper', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Project Details</Typography>
              <IconButton onClick={closeDrawer}><CloseIcon /></IconButton>
            </Box>

            {selected ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" fontWeight={700}>{selected.title}</Typography>
                <Typography variant="caption" color="text.secondary">{selected.id}</Typography>
                <Typography sx={{ mt: 2 }}>{selected.description}</Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Team</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    {selected.team.map(uid => {
                      const u = users.find(x => x.id === uid);
                      if (!u) return null;
                      return (
                        <Box key={uid} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={u.avatarUrl} sx={{ width: 32, height: 32 }} />
                          <Typography variant="body2">{u.name}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Chip label={`Priority: ${selected.priority}`} sx={{ mr: 1 }} />
                  <Chip label={`Status: ${selected.status}`} />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">Progress</Typography>
                  <LinearProgress variant="determinate" value={selected.progress} sx={{ height: 8, borderRadius: 4, mt: 1 }} />
                  <Typography variant="caption">{selected.tasksCompleted}/{selected.totalTasks} tasks completed</Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">Deadline</Typography>
                  <Typography>{formatDate(selected.deadline)}</Typography>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ mt: 2 }}>No project selected.</Typography>
            )}
          </Box>
        </Drawer>

        {/* new project dialog */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Dialog open={newOpen} onClose={() => setNewOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Create New Project</DialogTitle>
            <DialogContent>
              <TextField fullWidth label="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} sx={{ mt: 1 }} />
              <TextField fullWidth label="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} multiline rows={4} sx={{ mt: 2 }} />
              <TextField
                select
                label="Priority"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                fullWidth
                sx={{ mt: 2 }}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </TextField>

              {/*Team multi select querying from fetched users*/}
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(u) => u.name}
                value={newTeam}
                onChange={(_, v) => setNewTeam(v)}
                renderInput={(params) => <TextField {...params} label="Team members" sx={{ mt: 2 }} />}
              />

              {/* Deadline picker */}
              <DatePicker
                label="Deadline"
                value={newDeadline}
                onChange={(d) => setNewDeadline(d)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mt: 2 }
                  }
                }}
              />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAddProject} disabled={!newTitle.trim() || !newDeadline}>Create</Button>
            </DialogActions>
          </Dialog>
        </LocalizationProvider>
      </Container>
    </Box>
  );
}
