import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp, GridRowParams } from '@mui/x-data-grid';
import { useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';

const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Name',
    width: 200,
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

export default function MyAssetsPage() {
  const navigate = useNavigate();
  const machines = useQuery(api.machines.listMachinesByAssignedUser, {});

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
          My Assets
        </Typography>
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
    </Box>
  );
}
