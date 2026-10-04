import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider><AppRoutes /></AuthProvider>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
