import {
  type FormEvent,
  type UIEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  optimisticallySendMessage,
  useUIMessages,
} from '@convex-dev/agent/react';
import { Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MessageList } from './MessageList';
import { ScrollToBottomFab } from './ScrollToBottomFab';
import { MessageComposer } from './MessageComposer';

interface ChatInterfaceProps {
  threadId: string;
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export function ChatInterface({
  threadId,
  prompt,
  setPrompt,
}: ChatInterfaceProps) {
  const theme = useTheme();
  const {
    results: messages,
    status,
    loadMore,
  } = useUIMessages(
    api.chat.listThreadMessages,
    { threadId },
    { initialNumItems: 50, stream: true }
  );

  const sendMessage = useMutation(api.chat.sendMessage).withOptimisticUpdate(
    optimisticallySendMessage(api.chat.listThreadMessages)
  );

  // Get available models from config
  const modelsConfig = useQuery(api.appConfig.getConfig, {
    key: 'openrouter_models',
  });

  const availableModels = useMemo(() => {
    if (!modelsConfig) return [];
    try {
      const parsed = JSON.parse(modelsConfig);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [modelsConfig]);

  // Get the last used model for this thread
  const lastUsedModel = useQuery(api.chat.getLastUsedModel, { threadId });

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
  const [lastSetThreadId, setLastSetThreadId] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Set default model: prefer last used model, then fall back to first available model
  // This runs only when thread changes or when lastUsedModel loads for a new thread
  useEffect(() => {
    console.log('[ChatInterface] Model selection effect running', {
      threadId,
      lastUsedModel,
      lastSetThreadId,
      willSet:
        availableModels.length > 0 &&
        lastSetThreadId !== threadId &&
        lastUsedModel !== undefined,
    });

    // Only set model if we haven't set it for this thread yet
    if (availableModels.length > 0 && lastSetThreadId !== threadId) {
      // Wait for lastUsedModel query to complete (it's undefined while loading)
      if (lastUsedModel !== undefined) {
        // If there's a last used model and it's still in the available models, use it
        if (lastUsedModel && availableModels.includes(lastUsedModel)) {
          console.log(
            '[ChatInterface] Setting model to last used:',
            lastUsedModel
          );
          setSelectedModel(lastUsedModel);
        } else {
          // Otherwise, use the first available model
          console.log(
            '[ChatInterface] Setting model to first available:',
            availableModels[0]
          );
          setSelectedModel(availableModels[0]);
        }
        setLastSetThreadId(threadId);
      }
    }
    // Only depend on threadId, lastUsedModel, and availableModels
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, lastUsedModel, availableModels]);

  const totalMessages = messages?.length ?? 0;
  const hasMessages = totalMessages > 0;
  const isLoadingInitial = messages === undefined;
  const canLoadMore = status === 'CanLoadMore';
  const isLoadingMore = status === 'LoadingMore';
  const showLoadMoreButton = (canLoadMore || isLoadingMore) && hasMessages;

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const node = scrollContainerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior });
  };

  // Reset scroll tracking when switching threads
  useEffect(() => {
    setHasInitiallyScrolled(false);
    setAutoScrollEnabled(true);
  }, [threadId]);

  // Initial scroll to bottom when messages first load (instant, no animation)
  useEffect(() => {
    if (!hasInitiallyScrolled && hasMessages && !isLoadingInitial) {
      scrollToBottom('instant');
      setHasInitiallyScrolled(true);
    }
  }, [hasInitiallyScrolled, hasMessages, isLoadingInitial]);

  // Auto-scroll for new messages after initial load (smooth animation)
  useEffect(() => {
    if (!hasInitiallyScrolled) return; // Wait for initial scroll
    if (!autoScrollEnabled) return;
    if (!hasMessages) return;
    scrollToBottom('smooth');
  }, [
    hasInitiallyScrolled,
    autoScrollEnabled,
    hasMessages,
    totalMessages,
    messages,
  ]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasMessages) {
      setShowScrollToBottom(false);
      return;
    }
    const target = event.currentTarget;
    const distanceFromBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight;
    const atBottom = distanceFromBottom < 48;
    setAutoScrollEnabled(atBottom);
    setShowScrollToBottom(!atBottom);
  };

  const handleScrollToLatest = () => {
    setAutoScrollEnabled(true);
    setShowScrollToBottom(false);
    scrollToBottom('smooth');
  };

  const handleSend = async () => {
    if (isSending) return;
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt === '') return;
    if (!selectedModel) {
      console.error('No model selected');
      return;
    }
    try {
      setIsSending(true);
      setAutoScrollEnabled(true);
      await sendMessage({
        threadId,
        prompt: trimmedPrompt,
        modelId: selectedModel,
      });
      setPrompt('');
      requestAnimationFrame(() => scrollToBottom('smooth'));
      setShowScrollToBottom(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleComposerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSend();
  };

  const composerDisabled = isSending || prompt.trim() === '';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 0,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? '#212121'
              : theme.palette.background.paper,
          backdropFilter: 'blur(12px)',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <MessageList
            messages={messages}
            showLoadMoreButton={showLoadMoreButton}
            canLoadMore={canLoadMore}
            onLoadMore={loadMore}
            onScroll={handleScroll}
            scrollContainerRef={scrollContainerRef}
          />

          <ScrollToBottomFab
            show={showScrollToBottom}
            onClick={handleScrollToLatest}
          />
        </Box>

        <MessageComposer
          prompt={prompt}
          onPromptChange={setPrompt}
          onSend={handleSend}
          onSubmit={handleComposerSubmit}
          disabled={composerDisabled}
          isSending={isSending}
          onEnableAutoScroll={() => setAutoScrollEnabled(true)}
          availableModels={availableModels}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </Paper>
    </Box>
  );
}
