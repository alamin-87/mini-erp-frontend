import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { dashboardApi, productApi, getStoredUser } from "@/lib/api";
import { getRolePermissions } from "@/lib/permissions";
import type { DashboardStats, Product } from "@/types/app";
import gsap from "gsap";
import { Package, AlertTriangle, ArrowRight, DollarSign, Activity } from "lucide-react";

export default function DashboardPage() {
  const user = getStoredUser();
  const permissions = getRolePermissions(user?.role);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.stats,
  });

  const { data: productData } = useQuery({
    queryKey: ["dashboard-low-stock"],
    queryFn: () => productApi.list({ limit: 100 }),
  });

  const lowStockProducts = ((productData?.items || []) as Product[]).filter(
    (product) => product.stockQuantity < 5
  );

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.stagger-animate');
      gsap.fromTo(
        elements,
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(1.2)" }
      );
    }
  }, [isLoading]);

  const cards = [
    { title: "Total Products", value: data?.totalProducts ?? "—", icon: Package, color: "from-blue-500 to-indigo-500", light: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { title: "Low Stock Items", value: data?.lowStockProducts ?? "—", icon: AlertTriangle, color: "from-orange-500 to-amber-500", light: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    { title: "Total Sales", value: data?.totalSales ?? "—", icon: Activity, color: "from-emerald-500 to-teal-500", light: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  ];

  return (
    <div className="space-y-8" ref={containerRef}>
      <div className="stagger-animate mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight font-heading bg-gradient-to-r from-primary via-purple-500 to-foreground bg-clip-text text-transparent inline-block">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </h2>
        <p className="text-muted-foreground mt-2 text-lg font-medium">Here's your inventory and sales snapshot for today.</p>
      </div>

      {isLoading ? (
        <div className="stagger-animate flex justify-center py-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : null}
      
      {error ? (
        <div className="stagger-animate p-6 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-4 shadow-lg shadow-destructive/5">
          <div className="bg-destructive/20 p-3 rounded-full">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Failed to load data</h3>
            <p className="opacity-90">Unable to load dashboard statistics. Please try refreshing the page.</p>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div key={card.title} className="stagger-animate group relative overflow-hidden rounded-3xl bg-card border border-border p-6 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform duration-700 ease-out`}></div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className={`p-4 rounded-2xl border ${card.light} shadow-inner`}>
                    <card.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</p>
                    <p className="mt-1 text-4xl font-extrabold tracking-tight">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {permissions.canViewProducts ? (
              <Link to="/products" className="stagger-animate group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10 p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      <h3 className="text-2xl font-bold font-heading group-hover:text-primary transition-colors">Manage Products</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-base">Update inventory, add new stock items, and keep track of your entire product catalog seamlessly.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background shadow-sm border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/30 transition-all duration-300 transform group-hover:rotate-[-10deg]">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                </div>
              </Link>
            ) : null}
            {permissions.canCreateSales ? (
              <Link to="/sales" className="stagger-animate group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 p-8 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <h3 className="text-2xl font-bold font-heading group-hover:text-emerald-500 transition-colors">Record Sales</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-base">Create new sale records instantly, select multiple products, and calculate grand totals automatically.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-background shadow-sm border border-border group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-emerald-500/30 transition-all duration-300 transform group-hover:rotate-[-10deg]">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                </div>
              </Link>
            ) : null}
          </div>

          <div className="stagger-animate rounded-3xl bg-card border border-border overflow-hidden shadow-lg shadow-black/5">
            <div className="p-6 border-b border-border bg-gradient-to-r from-orange-500/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 text-orange-500 rounded-xl">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold font-heading">Low Stock Alerts</h3>
              </div>
              <span className="px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-md shadow-orange-500/20">
                {lowStockProducts.length} Items Need Attention
              </span>
            </div>
            
            {lowStockProducts.length > 0 ? (
              <ul className="divide-y divide-border">
                {lowStockProducts.map((product) => (
                  <li key={product._id} className="flex items-center justify-between px-8 py-5 hover:bg-muted/50 transition-colors group">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg group-hover:text-orange-500 transition-colors">{product.productName}</span>
                      <span className="text-sm text-muted-foreground font-medium">SKU: {product.sku || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                      <div className="hidden md:block w-32 bg-secondary rounded-full h-2.5 overflow-hidden border border-border shadow-inner">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full" style={{ width: `${Math.min((product.stockQuantity / 10) * 100, 100)}%` }}></div>
                      </div>
                      <span className="font-black text-orange-500 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-xl text-sm shadow-sm">
                        {product.stockQuantity} left
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-16 text-center flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 shadow-inner border border-emerald-500/20 transform rotate-12">
                  <Package className="h-10 w-10 transform -rotate-12" />
                </div>
                <p className="font-bold text-2xl text-foreground mb-2">Inventory is Healthy!</p>
                <p className="text-base max-w-sm">You have sufficient stock for all your products. No items are running low right now.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
