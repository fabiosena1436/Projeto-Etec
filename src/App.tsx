import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Toaster } from 'sonner';

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}
