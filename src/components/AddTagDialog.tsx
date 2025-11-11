import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface AddTagDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (key: string, value: string) => Promise<void>;
  isSubmitting?: boolean;
  initialKey?: string;
  initialValue?: string;
  isEdit?: boolean;
}

export default function AddTagDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialKey = '',
  initialValue = '',
  isEdit = false,
}: AddTagDialogProps) {
  const [key, setKey] = React.useState('');
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // Update form fields when dialog opens with initial values
  React.useEffect(() => {
    if (open) {
      setKey(initialKey);
      setValue(initialValue);
      setError(null);
    }
  }, [open, initialKey, initialValue]);

  const handleClose = () => {
    setKey('');
    setValue('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('Tag key is required');
      return;
    }
    if (!value.trim()) {
      setError('Tag value is required');
      return;
    }

    setError(null);
    try {
      await onSubmit(key.trim(), value.trim());
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEdit ? 'update' : 'create'} tag`
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit Tag' : 'Add Tag'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Key"
            fullWidth
            variant="standard"
            value={key}
            onChange={e => {
              setKey(e.target.value);
              setError(null);
            }}
            error={!!error && error.includes('key')}
            disabled={isSubmitting}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Value"
            fullWidth
            variant="standard"
            value={value}
            onChange={e => {
              setValue(e.target.value);
              setError(null);
            }}
            error={!!error && error.includes('value')}
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
            {isEdit ? 'Update tag' : 'Add tag'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
