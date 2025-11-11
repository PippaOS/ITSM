import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import AddTagDialog from './AddTagDialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import type { Id } from '../../convex/_generated/dataModel';

interface TagsProps {
  entityTable: string;
  entityId: string;
}

export default function Tags({ entityTable, entityId }: TagsProps) {
  const theme = useTheme();
  const tags = useQuery(api.tags.listTags, {
    entityTable,
    entityId,
  });
  const createTag = useMutation(api.tags.createTag);
  const updateTag = useMutation(api.tags.updateTag);
  const deleteTag = useMutation(api.tags.deleteTag);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingTagId, setEditingTagId] = React.useState<Id<'tags'> | null>(
    null
  );
  const [editingTagKey, setEditingTagKey] = React.useState('');
  const [editingTagValue, setEditingTagValue] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddTag = async (key: string, value: string) => {
    setIsSubmitting(true);
    try {
      await createTag({
        entityTable,
        entityId,
        key,
        value,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTag = React.useCallback(
    (tagId: Id<'tags'>, currentKey: string, currentValue: string) => {
      setEditingTagId(tagId);
      setEditingTagKey(currentKey);
      setEditingTagValue(currentValue);
      setEditDialogOpen(true);
    },
    []
  );

  const handleUpdateTag = async (key: string, value: string) => {
    if (!editingTagId) return;
    setIsSubmitting(true);
    try {
      await updateTag({
        tagId: editingTagId,
        key,
        value,
      });
      setEditDialogOpen(false);
      setEditingTagId(null);
      setEditingTagKey('');
      setEditingTagValue('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = React.useCallback(
    async (tagId: Id<'tags'>) => {
      try {
        await deleteTag({ tagId });
      } catch (err) {
        console.error('Failed to delete tag:', err);
      }
    },
    [deleteTag]
  );

  const columns: GridColDef[] = React.useMemo(
    () => [
      {
        field: 'key',
        headerName: 'Key',
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'value',
        headerName: 'Value',
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => (
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'center',
              height: '100%',
            }}
          >
            <IconButton
              onClick={e => {
                e.stopPropagation();
                handleEditTag(params.row._id, params.row.key, params.row.value);
              }}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={e => {
                e.stopPropagation();
                handleDeleteTag(params.row._id);
              }}
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [handleEditTag, handleDeleteTag]
  );

  const rows: GridRowsProp = React.useMemo(() => {
    if (!tags) return [];
    return tags.map(tag => ({
      id: tag._id,
      _id: tag._id,
      key: tag.key,
      value: tag.value,
    }));
  }, [tags]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
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
          New tag
        </Button>
      </Box>

      {tags === undefined ? (
        <Typography>Loading tags...</Typography>
      ) : tags.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No tags yet. Add the first tag!
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            sx={{ width: '100%', height: '100%' }}
          />
        </Box>
      )}

      <AddTagDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddTag}
        isSubmitting={isSubmitting}
      />
      <AddTagDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingTagId(null);
          setEditingTagKey('');
          setEditingTagValue('');
        }}
        onSubmit={handleUpdateTag}
        isSubmitting={isSubmitting}
        initialKey={editingTagKey}
        initialValue={editingTagValue}
        isEdit={true}
      />
    </Box>
  );
}
