import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import MyAssetsPage from './pages/MyAssetsPage';
import MyTicketsPage from './pages/MyTicketsPage';
import MachinesPage from './pages/MachinesPage';
import MachineDetailPage from './pages/MachineDetailPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import ChatPage from './pages/ChatPage';
import ChatsPage from './pages/ChatsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/my-assets" replace />}
                  />
                  <Route path="/my-assets" element={<MyAssetsPage />} />
                  <Route path="/my-tickets" element={<MyTicketsPage />} />
                  <Route path="/chats" element={<ChatsPage />} />
                  <Route path="/chats/:threadId?" element={<ChatPage />} />
                  <Route path="/machines" element={<MachinesPage />} />
                  <Route path="/machines/:id" element={<MachineDetailPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/users/:id" element={<UserDetailPage />} />
                  <Route path="/tickets" element={<TicketsPage />} />
                  <Route path="/tickets/:id" element={<TicketDetailPage />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
