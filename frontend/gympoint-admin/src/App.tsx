import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context';
import { Layout } from './presentation/components';
import { RealtimeProvider } from './presentation/components/RealtimeProvider';
import {
  DailyChallenges,
  Dashboard,
  Exercises,
  Gyms,
  Login,
  Reviews,
  Rewards,
  RoutineTemplates,
  Transactions,
  Users,
  Achievements,
} from './presentation/pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): ReactElement => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = (): ReactElement => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RealtimeProvider>
                    <Layout />
                  </RealtimeProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="gyms" element={<Gyms />} />
              <Route path="routines" element={<RoutineTemplates />} />
              <Route path="exercises" element={<Exercises />} />
              <Route path="daily-challenges" element={<DailyChallenges />} />
              <Route path="achievements" element={<Achievements />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
