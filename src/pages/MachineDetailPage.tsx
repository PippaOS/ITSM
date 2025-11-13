import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { useQuery, useMutation } from 'convex/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import NotesAndTags from '../components/NotesAndTags';
import {
  EditMachineDialog,
  EditMachineButton,
} from '../components/EditMachineDialog';

export default function MachineDetailPage() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const machineId = id as Id<'machines'>;
  const machineData = useQuery(api.machines.getMachineWithDetails, {
    machineId,
  });
  const users = useQuery(api.users.listUsers);
  const updateMachine = useMutation(api.machines.updateMachine);
  const [editOpen, setEditOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const machineTickets = useQuery(api.tickets.listTicketsByMachine, {
    machineId,
  });

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(machineId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Still loading
  if (machineData === undefined) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Machine not found
  if (machineData === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '1.5rem', mb: 3 }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/machines')}
            sx={{
              fontSize: 'inherit',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            Machines
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
              {machineId}
            </Link>
          </Tooltip>
        </Breadcrumbs>
        <Typography>Machine not found</Typography>
      </Box>
    );
  }

  const { machine, assignedToUser } = machineData;

  // All users can edit machines
  const canEdit = true;

  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '1.5rem' }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/machines')}
            sx={{
              fontSize: 'inherit',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            Machines
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
              {machineId}
            </Link>
          </Tooltip>
        </Breadcrumbs>
        {canEdit && <EditMachineButton onClick={handleEditOpen} />}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Details" sx={{ textTransform: 'none' }} />
          <Tab label="Tickets" sx={{ textTransform: 'none' }} />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Paper sx={{ p: 3, mt: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {machine.name}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Make
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {machine.make}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Model
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {machine.model}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Serial Number
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {machine.serialNumber || '—'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {machine.type}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                RAM
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {machine.ramGb} GB
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Storage
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {machine.storageCapacityGb} GB {machine.storageType}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Processor
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {machine.processorName}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Graphics Card
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {machine.graphicsCardName}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Assigned To
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {assignedToUser
                  ? assignedToUser.email
                    ? `${assignedToUser.name} (${assignedToUser.email})`
                    : assignedToUser.name
                  : '—'}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {machine.status}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {new Date(machine._creationTime).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          {machineTickets === undefined ? (
            <Typography>Loading tickets...</Typography>
          ) : machineTickets.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No tickets linked to this machine yet.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket #</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {machineTickets.map(ticket => (
                    <TableRow
                      key={ticket._id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/tickets/${ticket._id}`)}
                    >
                      <TableCell>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/tickets/${ticket._id}`);
                          }}
                          sx={{
                            textDecoration: 'underline',
                            color: 'primary.main',
                            cursor: 'pointer',
                            border: 'none',
                            background: 'none',
                            padding: 0,
                            font: 'inherit',
                          }}
                        >
                          {ticket._id}
                        </Link>
                      </TableCell>
                      <TableCell>{ticket.name}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ticket.description}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            ticket.status.charAt(0).toUpperCase() +
                            ticket.status.slice(1)
                          }
                          color={getStatusColor(ticket.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {ticket.userName}
                        {ticket.userEmail && ` (${ticket.userEmail})`}
                      </TableCell>
                      <TableCell>
                        {ticket.assignedToName
                          ? `${ticket.assignedToName}${ticket.assignedToEmail ? ` (${ticket.assignedToEmail})` : ''}`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {new Date(ticket._creationTime).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {tabValue === 0 && (
        <NotesAndTags entityTable="machines" entityId={machineId as string} />
      )}

      <EditMachineDialog
        machineId={machineId}
        machine={machine}
        users={users || undefined}
        updateMachine={async args => {
          await updateMachine(args);
        }}
        open={editOpen}
        onClose={handleEditClose}
      />
    </Box>
  );
}
