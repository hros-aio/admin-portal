export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background px-6 py-3">
        <div className="font-semibold">HROS Admin</div>
      </header>
      <div className="flex flex-1">
        <aside className="w-64 border-r bg-muted/40 p-4">
          <nav className="text-sm text-muted-foreground">Navigation placeholder</nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
