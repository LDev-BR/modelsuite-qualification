import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTalentsPage from './pages/admin/AdminTalentsPage';
import AdminTasksPage from './pages/admin/AdminTasksPage';
import SubmissionsPage from './pages/admin/SubmissionsPage';
import TalentDashboard from './pages/talent/TalentDashboard';
import TalentTasksPage from './pages/talent/TalentTasksPage';
import NotFoundPage from './pages/NotFoundPage';
import { ADMIN_ROUTES } from './utils/adminNavigation';
import { TALENT_ROUTES } from './utils/navigation';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path={ADMIN_ROUTES.dashboard}
                element={
                  <PrivateRoute role="Admin">
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path={ADMIN_ROUTES.tasks}
                element={
                  <PrivateRoute role="Admin">
                    <AdminTasksPage />
                  </PrivateRoute>
                }
              />
              <Route
                path={ADMIN_ROUTES.talents}
                element={
                  <PrivateRoute role="Admin">
                    <AdminTalentsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path={TALENT_ROUTES.dashboard}
                element={
                  <PrivateRoute role="Talent">
                    <TalentDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path={TALENT_ROUTES.tasks}
                element={
                  <PrivateRoute role="Talent">
                    <TalentTasksPage />
                  </PrivateRoute>
                }
              />
              <Route
                path={ADMIN_ROUTES.submissions}
                element={
                  <PrivateRoute role="Admin">
                    <SubmissionsPage />
                  </PrivateRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
