import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp, GridRowParams } from '@mui/x-data-grid';
import { alpha, useTheme } from '@mui/material/styles';
import { useQuery, useMutation } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import AddIcon from '@mui/icons-material/Add';
import AddTicketDialog from '../components/AddTicketDialog';

type TabValue = 'created' | 'assigned';

export default function MyTicketsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = React.useState<TabValue>('created');
  const createdTickets = useQuery(
    api.tickets.listTicketsCreatedByCurrentUser,
    {}
  );
  const assignedTickets = useQuery(
    api.tickets.listTicketsAssignedToCurrentUser,
    {}
  );
  const users = useQuery(api.users.listUsers);
  const createTicket = useMutation(api.tickets.createTicket);
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: '_id',
        headerName: 'Ticket #',
        width: 150,
        valueFormatter: (value?: string) => {
          if (!value) return '';
          return value;
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
        flex: 1,
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 300,
        flex: 1,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 130,
      },
      {
        field: 'userName',
        headerName: 'Created By',
        width: 180,
      },
      {
        field: 'assignedToName',
        headerName: 'Assigned To',
        width: 180,
        valueFormatter: (value?: string) => {
          return value || '—';
        },
      },
      {
        field: '_creationTime',
        headerName: 'Created',
        width: 180,
        valueFormatter: (value?: number) => {
          if (value == null) return '';
          return new Date(value).toLocaleString();
        },
      },
    ],
    []
  );

  const currentTickets =
    tabValue === 'created' ? createdTickets : assignedTickets;

  // Convert tickets data to rows format expected by DataGrid
  const rows: GridRowsProp = React.useMemo(() => {
    if (!currentTickets) return [];
    return currentTickets.map(ticket => ({
      id: ticket._id,
      ...ticket,
    }));
  }, [currentTickets]);

  const handleRowClick = (params: GridRowParams) => {
    navigate(`/tickets/${params.id}`);
  };

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: TabValue
  ) => {
    setTabValue(newValue);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (args: Parameters<typeof createTicket>[0]) => {
    setIsSubmitting(true);
    try {
      await createTicket(args);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        width: '100%',
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Typography variant="h5" component="h1">
          My Tickets
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleOpen}
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
          New ticket
        </Button>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Created" value="created" sx={{ textTransform: 'none' }} />
          <Tab
            label="Assigned"
            value="assigned"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Box>
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 25,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          loading={currentTickets === undefined}
          sx={{ width: '100%', height: '100%' }}
          onRowClick={handleRowClick}
        />
      </Box>

      <AddTicketDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        users={users}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}
