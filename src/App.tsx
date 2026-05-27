import { Router } from './routes';
import { Toaster } from 'sonner';

export function App() {
  return (
    <>
      <Router />
      <Toaster richColors position="top-right" />
    </>
  );
}
