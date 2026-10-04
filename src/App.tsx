import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { isSupabaseConfigured, isDemoMode } from './lib/supabase';
import { AppRoutes } from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ScrollToTop } from './components/ScrollToTop';

export function App() {
  if (!isSupabaseConfigured && !isDemoMode) {
    return <main style={{ maxWidth: 600, margin: '15vh auto', padding: 24 }} role="alert">
      <h1>Conecta Sampaio</h1>
      <p>A plataforma está em preparação. Tente novamente em alguns instantes.</p>
    </main>;
  }
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
        <Toaster richColors position="top-right" closeButton />
      </AuthProvider>
    </BrowserRouter>
  );
}
