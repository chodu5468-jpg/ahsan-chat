import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';
import { SocketProvider } from './context/SocketContext';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <SocketProvider>
              <ChatPage />
            </SocketProvider>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<AuthPage />} />
    </Routes>
  );
}
