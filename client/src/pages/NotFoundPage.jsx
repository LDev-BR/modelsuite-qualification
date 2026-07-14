// 404 — Page Not Found
const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-bg-dark text-text-primary">
    {/* Ambient glow */}
    <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none opacity-30"
      style={{ background: 'radial-gradient(circle, var(--ms-glow-primary) 0%, transparent 70%)' }} />

    <div className="relative z-10 text-center">
      <p className="text-[120px] font-extrabold tracking-tight leading-none gradient-text">404</p>
      <h1 className="text-2xl font-bold text-text-primary mt-2 mb-3">Page Not Found</h1>
      <p className="text-sm text-text-muted">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      
    </div>
  </div>
);

export default NotFoundPage;
