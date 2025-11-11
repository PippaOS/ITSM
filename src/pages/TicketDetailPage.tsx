import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { alpha, useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation } from 'convex/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import NotesAndTags from '../components/NotesAndTags';

type TabValue = 'details' | 'machines';

export default function TicketDetailPage() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ticketId = id as Id<'tickets'>;
  const ticket = useQuery(api.tickets.getTicket, { ticketId });
  const users = useQuery(api.users.listUsers);
  const machines = useQuery(api.machines.listMachines);
  const ticketMachines = useQuery(api.tickets.getMachinesForTicket, {
    ticketId,
  });
  const updateTicket = useMutation(api.tickets.updateTicket);
  const addMachineToTicket = useMutation(api.tickets.addMachineToTicket);
  const removeMachineFromTicket = useMutation(
    api.tickets.removeMachineFromTicket
  );

  const [tabValue, setTabValue] = React.useState<TabValue>('details');
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [addMachineDialogOpen, setAddMachineDialogOpen] = React.useState(false);
  const [selectedMachineId, setSelectedMachineId] =
    React.useState<Id<'machines'> | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    status: 'Open' as 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting',
    assignedTo: null as Id<'users'> | null,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Update form data when ticket loads
  React.useEffect(() => {
    if (ticket) {
      setFormData({
        name: ticket.name,
        description: ticket.description,
        status: ticket.status,
        assignedTo: ticket.assignedTo || null,
      });
    }
  }, [ticket]);

  const handleEdit = () => {
    if (ticket) {
      setFormData({
        name: ticket.name,
        description: ticket.description,
        status: ticket.status,
        assignedTo: ticket.assignedTo || null,
      });
      setEditDialogOpen(true);
      setError(null);
    }
  };

  const handleClose = () => {
    setEditDialogOpen(false);
    if (ticket) {
      setFormData({
        name: ticket.name,
        description: ticket.description,
        status: ticket.status,
        assignedTo: ticket.assignedTo || null,
      });
    }
    setError(null);
  };

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Name and description are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateTicket({
        ticketId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        assignedTo: formData.assignedTo,
      });
      setEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: TabValue
  ) => {
    setTabValue(newValue);
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleAddMachine = async () => {
    if (!selectedMachineId) return;

    setIsSubmitting(true);
    try {
      await addMachineToTicket({
        ticketId,
        machineId: selectedMachineId,
      });
      setAddMachineDialogOpen(false);
      setSelectedMachineId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add machine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMachine = React.useCallback(
    async (machineId: Id<'machines'>) => {
      if (
        !confirm(
          'Are you sure you want to remove this machine from the ticket?'
        )
      ) {
        return;
      }

      try {
        await removeMachineFromTicket({
          ticketId,
          machineId,
        });
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to remove machine');
      }
    },
    [removeMachineFromTicket, ticketId]
  );

  const getStatusColor = (
    status: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (status) {
      case 'Open':
        return 'default';
      case 'Assigned':
        return 'primary';
      case 'Closed':
        return 'success';
      case 'On Hold':
        return 'warning';
      case 'Awaiting':
        return 'info';
      default:
        return 'default';
    }
  };

  const machineColumns: GridColDef[] = React.useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
        flex: 1,
      },
      {
        field: 'make',
        headerName: 'Make',
        width: 150,
      },
      {
        field: 'model',
        headerName: 'Model',
        width: 150,
      },
      {
        field: 'type',
        headerName: 'Type',
        width: 120,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
      },
      {
        field: 'assignedToUserName',
        headerName: 'Assigned To',
        width: 150,
        valueFormatter: (value?: string) => value || '—',
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        sortable: false,
        renderCell: params => (
          <IconButton
            size="small"
            color="error"
            onClick={() => handleRemoveMachine(params.row._id)}
            title="Remove from ticket"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [handleRemoveMachine]
  );

  // Get available machines (not already assigned to this ticket)
  const availableMachines = React.useMemo(() => {
    if (!machines || !ticketMachines) return [];
    const assignedIds = new Set(ticketMachines.map(tm => tm._id));
    return machines.filter(m => !assignedIds.has(m._id));
  }, [machines, ticketMachines]);

  if (ticket === undefined) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (ticket === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '1.5rem', mb: 3 }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/tickets')}
            sx={{
              fontSize: 'inherit',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            Tickets
          </Link>
          <Tooltip
            title={copied ? 'Copied!' : 'Click to copy ID'}
            arrow
            onClose={() => setCopied(false)}
          >
            <Link
              component="button"
              underline="none"
              color="text.primary"
              onClick={handleCopyId}
              sx={{
                fontSize: 'inherit',
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              {ticketId}
            </Link>
          </Tooltip>
        </Breadcrumbs>
        <Typography>Ticket not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '1.5rem' }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/tickets')}
            sx={{
              fontSize: 'inherit',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            Tickets
          </Link>
          <Tooltip
            title={copied ? 'Copied!' : 'Click to copy ID'}
            arrow
            onClose={() => setCopied(false)}
          >
            <Link
              component="button"
              underline="none"
              color="text.primary"
              onClick={handleCopyId}
              sx={{
                fontSize: 'inherit',
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              {ticketId}
            </Link>
          </Tooltip>
        </Breadcrumbs>
        {tabValue === 'details' && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{
              borderRadius: 4,
              textTransform: 'none',
              border: 'none',
              backgroundColor:
                theme.palette.mode === 'dark' ? '#4b4b4b' : '#f4f4f4',
              color: theme.palette.primary.main,
              '&:hover': {
                border: 'none',
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            Edit
          </Button>
        )}
        {tabValue === 'machines' && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddMachineDialogOpen(true)}
            sx={{
              borderRadius: 4,
              textTransform: 'none',
              border: 'none',
              backgroundColor:
                theme.palette.mode === 'dark' ? '#4b4b4b' : '#f4f4f4',
              color: theme.palette.primary.main,
              '&:hover': {
                border: 'none',
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            Add Machine
          </Button>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Details" value="details" sx={{ textTransform: 'none' }} />
          <Tab
            label="Machines"
            value="machines"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Box>

      {tabValue === 'details' && (
        <>
          <Paper sx={{ p: 3, mt: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {ticket.name}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 2, whiteSpace: 'pre-wrap' }}
                >
                  {ticket.description}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={
                      ticket.status.charAt(0).toUpperCase() +
                      ticket.status.slice(1)
                    }
                    color={getStatusColor(ticket.status)}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {ticket.userName}
                  {ticket.userEmail && ` (${ticket.userEmail})`}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Assigned To
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {ticket.assignedToName
                    ? `${ticket.assignedToName}${ticket.assignedToEmail ? ` (${ticket.assignedToEmail})` : ''}`
                    : '—'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(ticket._creationTime).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <NotesAndTags entityTable="tickets" entityId={ticketId as string} />
        </>
      )}

      {tabValue === 'machines' && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Assigned Machines
          </Typography>
          <Box sx={{ height: 400, width: '100%', mt: 2 }}>
            <DataGrid
              rows={ticketMachines?.map(m => ({ ...m, id: m._id })) || []}
              columns={machineColumns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[5, 10, 25]}
              disableRowSelectionOnClick
              loading={ticketMachines === undefined}
            />
          </Box>
        </Paper>
      )}

      <Dialog
        open={editDialogOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>Edit Ticket</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  autoFocus
                  label="Name"
                  fullWidth
                  variant="standard"
                  value={formData.name}
                  onChange={handleChange('name')}
                  disabled={isSubmitting}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  fullWidth
                  variant="standard"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange('description')}
                  disabled={isSubmitting}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  variant="standard"
                  value={formData.status}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      status: e.target.value as typeof formData.status,
                    }))
                  }
                  disabled={isSubmitting}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Assigned">Assigned</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                  <MenuItem value="Awaiting">Awaiting</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={users || []}
                  getOptionLabel={option =>
                    option.email
                      ? `${option.name} (${option.email})`
                      : option.name
                  }
                  value={
                    formData.assignedTo
                      ? users?.find(u => u._id === formData.assignedTo) || null
                      : null
                  }
                  onChange={(_, newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      assignedTo: newValue?._id || null,
                    }));
                    setError(null);
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Assigned To"
                      variant="standard"
                      helperText="Optional - leave empty to unassign"
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>
            </Grid>
            {error && (
              <Box sx={{ color: 'error.main', mt: 2, fontSize: '0.875rem' }}>
                {error}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={addMachineDialogOpen}
        onClose={() => {
          setAddMachineDialogOpen(false);
          setSelectedMachineId(null);
          setError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Machine to Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              options={availableMachines}
              getOptionLabel={option =>
                `${option.name} (${option.make} ${option.model})`
              }
              value={
                selectedMachineId
                  ? availableMachines.find(m => m._id === selectedMachineId) ||
                    null
                  : null
              }
              onChange={(_, newValue) => {
                setSelectedMachineId(newValue?._id || null);
                setError(null);
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Select Machine"
                  variant="standard"
                  disabled={isSubmitting}
                />
              )}
            />
            {error && (
              <Box sx={{ color: 'error.main', mt: 2, fontSize: '0.875rem' }}>
                {error}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddMachineDialogOpen(false);
              setSelectedMachineId(null);
              setError(null);
            }}
            disabled={isSubmitting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMachine}
            variant="contained"
            disabled={!selectedMachineId || isSubmitting}
            sx={{ textTransform: 'none' }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
