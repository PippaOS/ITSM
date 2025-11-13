import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp, GridRowParams } from '@mui/x-data-grid';
import { usePaginatedQuery } from 'convex-helpers/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';

const columns: GridColDef[] = [
  {
    field: 'title',
    headerName: 'Title',
    width: 300,
    flex: 1,
    valueFormatter: (value?: string) => {
      return value && value.trim() !== '' ? value : 'Untitled chat';
    },
  },
  {
    field: '_id',
    headerName: 'Chat ID',
    width: 200,
    flex: 1,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
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

export default function ChatsPage() {
  const navigate = useNavigate();
  const threads = usePaginatedQuery(
    api.threads.listThreads,
    {},
    { initialNumItems: 50 }
  );

  // Convert threads data to rows format expected by DataGrid
  const rows: GridRowsProp = React.useMemo(() => {
    if (!threads.results) return [];
    return threads.results.map(thread => ({
      id: thread._id,
      ...thread,
    }));
  }, [threads.results]);

  const handleRowClick = (params: GridRowParams) => {
    navigate(`/chats/${encodeURIComponent(params.id as string)}`);
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
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Typography variant="h5" component="h1">
          Chats
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
          loading={threads.results === undefined}
          sx={{
            width: '100%',
            height: '100%',
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
          onRowClick={handleRowClick}
        />
      </Box>
    </Box>
  );
}
