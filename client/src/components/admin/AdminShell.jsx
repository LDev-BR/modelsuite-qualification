import Sidebar from './Sidebar';

const AdminShell = ({ children, className = '' }) => (
  <div className="admin-dashboard-shell flex min-h-screen app-shell">
    <Sidebar />
    <main className={`admin-dashboard-main flex-1 px-8 py-8 ${className}`.trim()}>
      {children}
    </main>
  </div>
);

export default AdminShell;
