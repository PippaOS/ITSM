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
import AddTeamDialog from '../components/AddTeamDialog';

const columns: GridColDef[] = [
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
    field: '_creationTime',
    headerName: 'Created',
    width: 180,
    valueFormatter: (value?: number) => {
      if (value == null) return '';
      return new Date(value).toLocaleString();
    },
  },
];

export default function TeamsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const teams = useQuery(api.teams.listTeams);
  const createTeam = useMutation(api.teams.createTeam);
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Convert teams data to rows format expected by DataGrid
  const rows: GridRowsProp = React.useMemo(() => {
    if (!teams) return [];
    return teams.map(team => ({
      id: team._id,
      ...team,
    }));
  }, [teams]);

  const handleRowClick = (params: GridRowParams) => {
    navigate(`/teams/${params.id}`);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (args: Parameters<typeof createTeam>[0]) => {
    setIsSubmitting(true);
    try {
      await createTeam(args);
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
          Teams
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
          New team
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1, width: '100%', minHeight: 0 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={row => row.id}
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
          loading={teams === undefined}
          sx={{
            width: '100%',
            height: '100%',
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
          onRowClick={handleRowClick}
          paginationMode="client"
        />
      </Box>

      <AddTeamDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Box>
  );
}
