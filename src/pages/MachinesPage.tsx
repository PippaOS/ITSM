import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp, GridRowParams } from '@mui/x-data-grid';
import { alpha, useTheme } from '@mui/material/styles';
import { useQuery, useMutation } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import AddIcon from '@mui/icons-material/Add';
import AddMachineDialog from '../components/AddMachineDialog';

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Name',
    width: 200,
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
    field: 'ramGb',
    headerName: 'RAM (GB)',
    type: 'number',
    width: 120,
  },
  {
    field: 'storageCapacityGb',
    headerName: 'Storage (GB)',
    type: 'number',
    width: 140,
  },
  {
    field: 'storageType',
    headerName: 'Storage Type',
    width: 130,
  },
  {
    field: 'graphicsCardName',
    headerName: 'Graphics Card',
    width: 180,
  },
  {
    field: 'processorName',
    headerName: 'Processor',
    width: 180,
  },
  {
    field: 'assignedToUserEmail',
    headerName: 'Assigned To',
    width: 200,
    valueFormatter: (value?: string) => {
      return value || '—';
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 130,
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
];

export default function MachinesPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const machines = useQuery(api.machines.listMachines);
  const users = useQuery(api.users.listUsers);
  const createMachine = useMutation(api.machines.createMachine);
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Convert machines data to rows format expected by DataGrid
  const rows: GridRowsProp = React.useMemo(() => {
    if (!machines) return [];
    return machines.map(machine => ({
      id: machine._id,
      ...machine,
    }));
  }, [machines]);

  const handleRowClick = (params: GridRowParams) => {
    navigate(`/machines/${params.id}`);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (args: Parameters<typeof createMachine>[0]) => {
    setIsSubmitting(true);
    try {
      await createMachine(args);
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
          Machines
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
          New machine
        </Button>
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
          loading={machines === undefined}
          sx={{ width: '100%', height: '100%' }}
          onRowClick={handleRowClick}
        />
      </Box>

      <AddMachineDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        users={users}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}
