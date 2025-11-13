import {
  type FormEvent,
  type UIEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation, useQuery } from 'convex/react';
import type { OptimisticLocalStore } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import {
  optimisticallySendMessage,
  useUIMessages,
} from '@convex-dev/agent/react';
import { Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MessageList } from './MessageList';
import { ScrollToBottomFab } from './ScrollToBottomFab';
import { MessageComposer, type MessageComposerRef } from './MessageComposer';
import { ChatWelcome } from './ChatWelcome';

interface ChatInterfaceProps {
  threadId: string | null;
  prompt: string;
  setPrompt: (prompt: string) => void;
  onThreadCreated?: (threadId: string) => void;
}

export function ChatInterface({
  threadId,
  prompt,
  setPrompt,
  onThreadCreated,
}: ChatInterfaceProps) {
  const theme = useTheme();
  const isDraft = threadId === null;

  const {
    results: messages,
    status,
    loadMore,
  } = useUIMessages(
    api.chat.listThreadMessages,
    threadId ? { threadId } : 'skip',
    { initialNumItems: 50, stream: true }
  );

  const sendMessage = useMutation(api.chat.sendMessage).withOptimisticUpdate(
    (
      store: OptimisticLocalStore,
      args: { threadId?: string; prompt: string; modelId: string }
    ) => {
      // Only apply optimistic update if threadId is provided
      // (can't optimistically update a thread that doesn't exist yet)
      if (args.threadId) {
        optimisticallySendMessage(api.chat.listThreadMessages)(store, {
          threadId: args.threadId,
          prompt: args.prompt,
        });
      }
    }
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

  // Get the last used model for this thread (skip if draft)
  const lastUsedModel = useQuery(
    api.chat.getLastUsedModel,
    threadId ? { threadId } : 'skip'
  );

  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);
  const [lastSetThreadId, setLastSetThreadId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messageComposerRef = useRef<MessageComposerRef>(null);

  // Set default model: prefer last used model, then fall back to first available model
  // This runs only when thread changes or when lastUsedModel loads for a new thread
  useEffect(() => {
    // Use a special marker for draft mode to distinguish from null threadId
    const currentThreadKey = isDraft ? 'draft' : threadId;

    console.log('[ChatInterface] Model selection effect running', {
      threadId,
      isDraft,
      currentThreadKey,
      lastUsedModel,
      lastSetThreadId,
      willSet:
        availableModels.length > 0 &&
        lastSetThreadId !== currentThreadKey &&
        (isDraft || lastUsedModel !== undefined),
    });

    // Only set model if we haven't set it for this thread yet
    if (availableModels.length > 0 && lastSetThreadId !== currentThreadKey) {
      // For draft mode, just use first available model
      if (isDraft) {
        console.log(
          '[ChatInterface] Draft mode - setting model to first available:',
          availableModels[0]
        );
        setSelectedModel(availableModels[0]);
        setLastSetThreadId('draft');
      } else if (lastUsedModel !== undefined) {
        // For existing threads, wait for lastUsedModel query to complete
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
    // Only depend on threadId, isDraft, lastUsedModel, and availableModels
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, isDraft, lastUsedModel, availableModels]);

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

  // Reset scroll tracking when switching threads (including to/from draft)
  useEffect(() => {
    setHasInitiallyScrolled(false);
    setAutoScrollEnabled(true);
  }, [threadId, isDraft]);

  // Focus input when entering draft mode (new chat)
  useEffect(() => {
    if (isDraft) {
      // Small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        messageComposerRef.current?.focusInput();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDraft]);

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

      // Send message - if in draft mode (threadId is null), the mutation will create the thread
      const result = await sendMessage({
        threadId: threadId ?? undefined,
        prompt: trimmedPrompt,
        modelId: selectedModel,
      });

      // If we were in draft mode and got a threadId back, notify parent to update URL
      if (isDraft && result?.threadId && onThreadCreated) {
        onThreadCreated(result.threadId);
      }

      setPrompt('');
      requestAnimationFrame(() => scrollToBottom('smooth'));
      setShowScrollToBottom(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
      // Refocus the input field after sending completes
      messageComposerRef.current?.focusInput();
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
          {isDraft ? (
            <ChatWelcome />
          ) : (
            <>
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
            </>
          )}
        </Box>

        <MessageComposer
          ref={messageComposerRef}
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
