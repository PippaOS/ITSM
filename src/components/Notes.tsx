import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import AddNoteDialog from './AddNoteDialog';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import type { Id } from '../../convex/_generated/dataModel';

interface NotesProps {
  entityTable: string;
  entityId: string;
}

export default function Notes({ entityTable, entityId }: NotesProps) {
  const theme = useTheme();
  const notes = useQuery(api.notes.listNotes, {
    entityTable,
    entityId,
  });
  const createNote = useMutation(api.notes.createNote);
  const updateNote = useMutation(api.notes.updateNote);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingNoteId, setEditingNoteId] = React.useState<Id<'notes'> | null>(
    null
  );
  const [editingNoteContent, setEditingNoteContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddNote = async (content: string) => {
    setIsSubmitting(true);
    try {
      await createNote({
        entityTable,
        entityId,
        content,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = (noteId: Id<'notes'>, currentContent: string) => {
    setEditingNoteId(noteId);
    setEditingNoteContent(currentContent);
    setEditDialogOpen(true);
  };

  const handleUpdateNote = async (content: string) => {
    if (!editingNoteId) return;
    setIsSubmitting(true);
    try {
      await updateNote({
        noteId: editingNoteId,
        content,
      });
      setEditDialogOpen(false);
      setEditingNoteId(null);
      setEditingNoteContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          New note
        </Button>
      </Box>

      {notes === undefined ? (
        <Typography>Loading notes...</Typography>
      ) : notes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No notes yet. Add the first note!
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {notes.map((note, index) => (
              <React.Fragment key={note._id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Typography
                        component="div"
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {note.content}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'block', mt: 1 }}>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {new Date(note._creationTime).toLocaleString()}
                          {note.createdByEmail && ` • ${note.createdByEmail}`}
                        </Typography>
                      </Box>
                    }
                  />
                  {note.canEdit && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditNote(note._id, note.content)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                {index < notes.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      <AddNoteDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddNote}
        isSubmitting={isSubmitting}
      />
      <AddNoteDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingNoteId(null);
          setEditingNoteContent('');
        }}
        onSubmit={handleUpdateNote}
        isSubmitting={isSubmitting}
        initialContent={editingNoteContent}
        isEdit={true}
      />
    </Box>
  );
}
