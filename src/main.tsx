import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { ThemedApp } from './components/ThemedApp';

const convexUrl = import.meta.env.VITE_CONVEX_URL;

// Debug: log what we're getting (remove in production)
if (typeof window !== 'undefined') {
  console.log('VITE_CONVEX_URL:', convexUrl ? 'Found' : 'Missing', convexUrl);
  console.log(
    'All VITE_ env vars:',
    Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
  );
}

if (!convexUrl || convexUrl.trim() === '') {
  throw new Error(
    `Missing or empty VITE_CONVEX_URL environment variable. 
    Value received: "${convexUrl}"
    Please check your .env.local file exists and contains: VITE_CONVEX_URL=https://your-deployment.convex.cloud`
  );
}

// Validate that the URL is absolute
try {
  new URL(convexUrl);
} catch {
  throw new Error(
    `VITE_CONVEX_URL must be an absolute URL (e.g., https://your-deployment.convex.cloud). Got: "${convexUrl}"`
  );
}

const convex = new ConvexReactClient(convexUrl);

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPublishableKey) {
  throw new Error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY environment variable. Please check your .env.local file.'
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemedApp />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </React.StrictMode>
);
