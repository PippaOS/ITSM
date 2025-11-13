import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePaginatedQuery } from 'convex-helpers/react';
import { api } from '../../convex/_generated/api';
import { Box } from '@mui/material';
import { ChatInterface } from '../components/chat/ChatInterface';

export default function ChatPage() {
  const { threadId: threadIdParam } = useParams<{ threadId?: string }>();
  const isDraft = threadIdParam === 'new';
  const threadId = isDraft ? null : (threadIdParam ?? null);
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  // Get list of threads to navigate to next one if current is deleted
  const threads = usePaginatedQuery(
    api.threads.listThreads,
    {},
    { initialNumItems: 50 }
  );

  // Auto-navigate to first thread only if we're at /chats (no param at all)
  useEffect(() => {
    if (
      !threadIdParam &&
      !isDraft &&
      threads.results &&
      threads.results.length > 0
    ) {
      navigate(`/chats/${encodeURIComponent(threads.results[0]._id)}`, {
        replace: true,
      });
    }
  }, [threadIdParam, isDraft, threads.results, navigate]);

  // Handle case where thread doesn't exist (was deleted)
  useEffect(() => {
    // Skip if we're in draft mode
    if (isDraft) return;

    // Only navigate if threads have loaded and we have a threadId
    if (threadId && threads.results !== undefined) {
      // Check if current thread exists in the list
      const currentThreadExists = threads.results.some(t => t._id === threadId);

      // If thread doesn't exist in list (was deleted), navigate away
      if (!currentThreadExists) {
        // Find next available thread or go to /chats
        const availableThreads = threads.results.filter(
          t => t._id !== threadId
        );
        if (availableThreads.length > 0) {
          navigate(`/chats/${encodeURIComponent(availableThreads[0]._id)}`, {
            replace: true,
          });
        } else {
          navigate('/chats', { replace: true });
        }
      }
    }
  }, [isDraft, threadId, threads.results, navigate]);

  // Callback to update URL after thread is created from draft
  const handleThreadCreated = (newThreadId: string) => {
    navigate(`/chats/${encodeURIComponent(newThreadId)}`, { replace: true });
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        py: { xs: 2, md: 4 },
      }}
    >
      <ChatInterface
        threadId={threadId}
        prompt={prompt}
        setPrompt={setPrompt}
        onThreadCreated={handleThreadCreated}
      />
    </Box>
  );
}
