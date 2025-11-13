import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function SettingsPage() {
  const config = useQuery(api.appConfig.listConfig);
  const setConfig = useMutation(api.appConfig.setConfig);

  const [models, setModels] = React.useState<string[]>([]);
  const [zdrEnabled, setZdrEnabled] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newModelInput, setNewModelInput] = React.useState('');
  const [newModelError, setNewModelError] = React.useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  // Load current settings from config
  React.useEffect(() => {
    if (config) {
      const modelConfig = config.find(c => c.key === 'openrouter_models');
      if (modelConfig) {
        try {
          const parsedModels = JSON.parse(modelConfig.value);
          setModels(Array.isArray(parsedModels) ? parsedModels : []);
        } catch {
          // If parsing fails, treat as empty array
          setModels([]);
        }
      }

      const zdrConfig = config.find(c => c.key === 'openrouter_zdr');
      if (zdrConfig) {
        setZdrEnabled(zdrConfig.value === 'true');
      }
    }
  }, [config]);

  const handleSaveModels = async (updatedModels: string[]) => {
    if (updatedModels.length === 0) {
      setSaveError('At least one model must be configured');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await setConfig({
        key: 'openrouter_models',
        value: JSON.stringify(updatedModels),
      });
      setModels(updatedModels);
      setSnackbarOpen(true);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Failed to save configuration'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModel = (modelToDelete: string) => {
    const updatedModels = models.filter(m => m !== modelToDelete);
    void handleSaveModels(updatedModels);
  };

  const handleAddModel = () => {
    const trimmedModel = newModelInput.trim();

    if (!trimmedModel) {
      setNewModelError('Model identifier cannot be empty');
      return;
    }

    if (models.includes(trimmedModel)) {
      setNewModelError('This model is already in the list');
      return;
    }

    const updatedModels = [...models, trimmedModel];
    void handleSaveModels(updatedModels);
    setAddDialogOpen(false);
    setNewModelInput('');
    setNewModelError(null);
  };

  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
    setNewModelInput('');
    setNewModelError(null);
  };

  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setNewModelInput('');
    setNewModelError(null);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" component="h1" sx={{ mb: 3 }}>
        Settings
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          AI Model Configuration
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure the OpenRouter AI models available for chat responses. You
          can add multiple models and select which one to use in each chat.
        </Typography>

        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Available models
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              disabled={isSaving}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Add model
            </Button>
          </Box>

          {models.length === 0 ? (
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No models configured. Click "Add model" to get started.
              </Typography>
            </Box>
          ) : (
            <List
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              {models.map((model, index) => (
                <ListItem
                  key={model}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteModel(model)}
                      disabled={isSaving}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  divider={index < models.length - 1}
                >
                  <ListItemText
                    primary={model}
                    primaryTypographyProps={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {config?.find(c => c.key === 'openrouter_models') && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            Last updated:{' '}
            {new Date(
              config.find(c => c.key === 'openrouter_models')!.updatedAt
            ).toLocaleString()}
          </Typography>
        )}
      </Paper>

      {/* Add Model Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Model</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the OpenRouter model identifier.
          </Typography>

          <TextField
            autoFocus
            fullWidth
            label="Model Identifier"
            placeholder="e.g., google/gemini-2.5-flash-preview-09-2025"
            value={newModelInput}
            onChange={e => {
              setNewModelInput(e.target.value);
              setNewModelError(null);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddModel();
              }
            }}
            error={!!newModelError}
            helperText={
              newModelError || 'Enter the full OpenRouter model identifier'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            onClick={handleAddModel}
            variant="contained"
            disabled={!newModelInput.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Privacy Settings
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure privacy settings for OpenRouter API calls.{' '}
          <Link
            href="https://openrouter.ai/docs/features/zdr"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more about Zero Data Retention
          </Link>
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={zdrEnabled}
              onChange={async e => {
                const newValue = e.target.checked;
                setZdrEnabled(newValue);
                setIsSaving(true);
                setSaveError(null);

                try {
                  await setConfig({
                    key: 'openrouter_zdr',
                    value: newValue ? 'true' : 'false',
                  });
                  setSnackbarOpen(true);
                } catch (error) {
                  setSaveError(
                    error instanceof Error
                      ? error.message
                      : 'Failed to save configuration'
                  );
                  // Revert the switch on error
                  setZdrEnabled(!newValue);
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
            />
          }
          label={
            <Box>
              <Typography variant="body1">
                Enable Zero Data Retention (ZDR)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                When enabled, requests will only be routed to endpoints that
                have a Zero Data Retention policy. This ensures your data is not
                stored by the provider.
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />

        {config?.find(c => c.key === 'openrouter_zdr') && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Last updated:{' '}
            {new Date(
              config.find(c => c.key === 'openrouter_zdr')!.updatedAt
            ).toLocaleString()}
          </Typography>
        )}
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Configuration saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
