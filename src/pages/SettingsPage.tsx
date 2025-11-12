import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function SettingsPage() {
  const config = useQuery(api.appConfig.listConfig);
  const setConfig = useMutation(api.appConfig.setConfig);

  const [modelName, setModelName] = React.useState('');
  const [zdrEnabled, setZdrEnabled] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  // Load current settings from config
  React.useEffect(() => {
    if (config) {
      const modelConfig = config.find(c => c.key === 'openrouter_model');
      if (modelConfig) {
        setModelName(modelConfig.value);
      }

      const zdrConfig = config.find(c => c.key === 'openrouter_zdr');
      if (zdrConfig) {
        setZdrEnabled(zdrConfig.value === 'true');
      }
    }
  }, [config]);

  const handleSaveModel = async () => {
    if (!modelName.trim()) {
      setSaveError('Model name cannot be empty');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await setConfig({
        key: 'openrouter_model',
        value: modelName.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Failed to save configuration'
      );
    } finally {
      setIsSaving(false);
    }
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
          Configure the OpenRouter AI model used for chat responses. Enter the
          model identifier (e.g., google/gemini-2.5-flash-preview-09-2025).
        </Typography>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Configuration saved successfully!
          </Alert>
        )}

        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Model Name"
          value={modelName}
          onChange={e => setModelName(e.target.value)}
          placeholder="google/gemini-2.5-flash-preview-09-2025"
          sx={{ mb: 2 }}
          helperText="The OpenRouter model identifier to use for AI responses"
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSaveModel}
            disabled={isSaving || !modelName.trim()}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          {config?.find(c => c.key === 'openrouter_model') && (
            <Button
              variant="outlined"
              onClick={() => {
                const defaultModel = 'google/gemini-2.5-flash-preview-09-2025';
                setModelName(defaultModel);
              }}
            >
              Reset to Default
            </Button>
          )}
        </Box>

        {config?.find(c => c.key === 'openrouter_model') && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: 'block' }}
          >
            Last updated:{' '}
            {new Date(
              config.find(c => c.key === 'openrouter_model')!.updatedAt
            ).toLocaleString()}
          </Typography>
        )}
      </Paper>

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
                setSaveSuccess(false);
                setSaveError(null);

                try {
                  await setConfig({
                    key: 'openrouter_zdr',
                    value: newValue ? 'true' : 'false',
                  });
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
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
    </Box>
  );
}
