import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface AddNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting?: boolean;
  initialContent?: string;
  isEdit?: boolean;
}

export default function AddNoteDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialContent = '',
  isEdit = false,
}: AddNoteDialogProps) {
  const [content, setContent] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // Update content when dialog opens with initial content
  React.useEffect(() => {
    if (open) {
      setContent(initialContent);
      setError(null);
    }
  }, [open, initialContent]);

  const handleClose = () => {
    setContent('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Note content is required');
      return;
    }

    setError(null);
    try {
      await onSubmit(content.trim());
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEdit ? 'update' : 'create'} note`
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit Note' : 'Add Note'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Note"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={content}
            onChange={e => {
              setContent(e.target.value);
              setError(null);
            }}
            error={!!error}
            helperText={error}
            disabled={isSubmitting}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{
              borderRadius: 4,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              borderRadius: 4,
              textTransform: 'none',
            }}
          >
            {isEdit ? 'Update note' : 'Add note'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
