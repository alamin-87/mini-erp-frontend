import { useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart } from "lucide-react";
import { clearAuth, getStoredUser } from "@/lib/api";
import { getRolePermissions } from "@/lib/permissions";
import gsap from "gsap";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, permission: "canViewDashboard" as const },
  { to: "/products", label: "Products", icon: Package, permission: "canViewProducts" as const },
  { to: "/sales", label: "Sales", icon: ShoppingCart, permission: "canCreateSales" as const },
];

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const permissions = getRolePermissions(user?.role);
  
  const sidebarRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Animation for Sidebar and Header
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    }
    if (mainRef.current) {
      gsap.fromTo(
        mainRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: "power3.out" }
      );
    }
  }, []);

  // Animate page transitions on pathname change
  useEffect(() => {
    const pageContent = document.querySelector(".page-content");
    if (pageContent) {
      gsap.fromTo(
        pageContent,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-transparent font-sans">
      {/* Sidebar */}
      <aside ref={sidebarRef} className="hidden md:flex w-72 flex-col border-r border-white/10 glass z-10 m-4 rounded-3xl overflow-hidden shadow-2xl shadow-primary/5">
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-8 bg-primary/5">
          <div className="rounded-xl bg-gradient-to-br from-primary to-purple-500 p-2 text-white shadow-lg shadow-primary/20">
            <Package className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight font-heading bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Mini ERP
          </span>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            const canAccess = permissions[item.permission];

            if (!canAccess) {
              return null;
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 p-5 border border-primary/20 relative overflow-hidden backdrop-blur-md">
             <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
             <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1 relative z-10">Pro Tip</p>
             <p className="text-xs text-muted-foreground relative z-10">Press <kbd className="px-1.5 py-0.5 rounded-md bg-background/80 shadow-sm border border-border text-[10px] font-mono font-bold text-foreground mx-1">Ctrl+K</kbd> to search anywhere</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div ref={mainRef} className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-20 items-center justify-between px-8 py-4 mt-4 mr-4 mb-4 rounded-3xl glass border border-white/10 z-10 shadow-xl shadow-black/5">
          <h1 className="text-2xl font-bold font-heading bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {navItems.find(i => i.to === pathname)?.label || "Mini ERP"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-background/40 backdrop-blur-md border border-border/50 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-background">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-none">{user?.name || "User"}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{user?.role || "Role"}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground px-5 py-2.5 text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-8 pb-8 mr-4 mb-4 rounded-3xl glass border border-white/10 overflow-auto page-content custom-scrollbar shadow-2xl shadow-black/5 relative">
          <div className="py-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
