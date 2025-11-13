import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp, GridRowParams } from '@mui/x-data-grid';
import { useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Name',
    width: 200,
    flex: 1,
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 250,
    flex: 1,
  },
  {
    field: 'externalId',
    headerName: 'External ID',
    width: 200,
  },
  {
    field: 'tokenIdentifier',
    headerName: 'Token Identifier',
    width: 200,
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

export default function UsersPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const users = useQuery(api.users.listUsers);
  const [open, setOpen] = React.useState(false);

  // Convert users data to rows format expected by DataGrid
  const rows: GridRowsProp = React.useMemo(() => {
    if (!users) return [];
    return users.map(user => ({
      id: user._id,
      ...user,
    }));
  }, [users]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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
        <Typography variant="h5" component="h1">
          Users
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
          New user
        </Button>
      </Box>

      <Box sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
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
          disableRowSelectionOnClick
          loading={users === undefined}
          sx={{
            width: '100%',
            height: '100%',
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
          onRowClick={(params: GridRowParams) => {
            navigate(`/users/${params.id}`);
          }}
          paginationMode="client"
        />
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1 }}>
            To add a new user, please go to the Clerk dashboard.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
