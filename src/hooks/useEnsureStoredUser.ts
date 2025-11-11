import { useEffect, useState } from 'react';
import { useConvexAuth, useMutation } from 'convex/react';
import { useUser } from '@clerk/clerk-react';
import type { Id } from '../../convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';

interface EnsureStoredUserState {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: Id<'users'> | null;
  error: Error | null;
}

export function useEnsureStoredUser(): EnsureStoredUserState {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const storeUser = useMutation(api.users.store);
  const [userId, setUserId] = useState<Id<'users'> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setUserId(null);
      return;
    }

    let cancelled = false;

    const ensureUser = async () => {
      try {
        setError(null);
        const id = await storeUser();
        if (!cancelled) {
          setUserId(id);
        }
      } catch (caught) {
        console.error('Failed to store user in Convex', caught);
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught
              : new Error('Failed to store user in Convex')
          );
        }
      }
    };

    ensureUser();

    return () => {
      cancelled = true;
      setUserId(null);
      setError(null);
    };
  }, [isAuthenticated, storeUser, user?.id]);

  return {
    isLoading:
      authLoading || (isAuthenticated && error === null && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
    userId,
    error,
  };
}
