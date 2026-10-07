import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { AppShell, LoadingState } from './components/shared';
import {
  ApplicationFormPage, DashboardPage, HomePage, HowItWorksPage,
  LoginPage, NotFoundPage, ProfilePage, ServicesPage, SignupPage,
} from './pages/DocumentPages';
import { ServiceDetailPage } from './pages/ServicePages';
import { RecentActivityPage } from './pages/RecentActivityPage';

const queryClient = new QueryClient();

function Router() {
  const { user, loadingAuth } = useApp();

  if (loadingAuth) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <RoutedErrorBoundary>
        <AppShell>
          <LoginPage />
        </AppShell>
      </RoutedErrorBoundary>
    );
  }

  return (
    <RoutedErrorBoundary>
      <AppShell>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/services/:serviceId" component={ServiceDetailPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/applications" component={RecentActivityPage} />
          <Route path="/applications/add" component={ApplicationFormPage} />
          <Route path="/how-it-works" component={HowItWorksPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route component={NotFoundPage} />
        </Switch>
      </AppShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AppProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AppProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
