import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi, getStoredUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { getRolePermissions } from "@/lib/permissions";
import type { Product } from "@/types/app";
import { Package, Search, Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle2, AlertTriangle } from "lucide-react";
import gsap from "gsap";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    productName: "",
    sku: "",
    category: "",
    purchasePrice: "",
    sellingPrice: "",
    stockQuantity: "",
    productImage: null as File | null,
  });
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = getStoredUser();
  const permissions = getRolePermissions(user?.role);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableSectionElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", page, search],
    queryFn: () => productApi.list({ page, limit: 8, searchTerm: search }),
  });

  const items = (data?.items || []) as Product[];
  const meta = data?.meta as { page?: number; totalPages?: number } | undefined;

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.stagger-animate');
      gsap.fromTo(
        elements,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && items.length > 0 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('tr');
      gsap.fromTo(
        rows,
        { x: -10, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [items, isLoading]);

  const canSubmit = useMemo(() => {
    return form.productName && form.sku && form.category && form.purchasePrice && form.sellingPrice && form.stockQuantity && (!editingId ? form.productImage : true);
  }, [form, editingId]);

  const resetForm = () => {
    setForm({
      productName: "",
      sku: "",
      category: "",
      purchasePrice: "",
      sellingPrice: "",
      stockQuantity: "",
      productImage: null,
    });
    setEditingId(null);
    setImagePreview(null);
    setMessage("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setForm(prev => ({ ...prev, productImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setForm(prev => ({ ...prev, productImage: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const payload = new FormData();
    payload.append("productName", form.productName);
    payload.append("sku", form.sku);
    payload.append("category", form.category);
    payload.append("purchasePrice", form.purchasePrice);
    payload.append("sellingPrice", form.sellingPrice);
    payload.append("stockQuantity", form.stockQuantity);

    if (form.productImage) {
      payload.append("productImage", form.productImage);
    }

    try {
      if (editingId) {
        await productApi.update(editingId, payload);
        setMessage("Product updated successfully.");
      } else {
        await productApi.create(payload);
        setMessage("Product created successfully.");
      }

      resetForm();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch {
      setMessage(editingId ? "Unable to update the product." : "Unable to create the product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this product?")) {
      try {
        await productApi.remove(id);
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } catch {
        setMessage("Unable to delete the product.");
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);
    setForm({
      productName: product.productName,
      sku: product.sku,
      category: product.category,
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      stockQuantity: product.stockQuantity.toString(),
      productImage: null,
    });
    setImagePreview(product.productImage || null);
    setMessage("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!permissions.canViewProducts) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center text-destructive shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="font-medium">You do not have permission to view products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" ref={containerRef}>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between stagger-animate">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight font-heading bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent inline-flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
               <Package className="h-8 w-8 text-primary" />
            </div>
            Products Inventory
          </h2>
          <p className="text-muted-foreground mt-3 text-lg font-medium">Add, search, and comprehensively manage your products catalog.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className="w-full md:w-80 rounded-2xl border border-input bg-card/60 backdrop-blur-md pl-12 pr-5 py-4 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm font-medium"
          />
        </div>
      </div>

      {permissions.canManageProducts ? (
        <form onSubmit={handleSubmit} className="stagger-animate space-y-6 rounded-3xl border border-border bg-card/60 backdrop-blur-md p-8 shadow-xl shadow-black/5">
          <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-5">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold font-heading">{editingId ? "Edit Product Details" : "Add New Product"}</h3>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-bold text-foreground">Product Name</label>
              <input value={form.productName} onChange={(event) => setForm((current) => ({ ...current, productName: event.target.value }))} placeholder="e.g. Wireless Noise-Cancelling Headphones" className="w-full rounded-xl border border-input bg-background/50 px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">SKU Code</label>
              <input value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} placeholder="WH-001" className="w-full rounded-xl border border-input bg-background/50 px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium font-mono" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Category</label>
              <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Electronics" className="w-full rounded-xl border border-input bg-background/50 px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium" required />
            </div>
            
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-foreground">Purchase Price</label>
              <div className="absolute left-4 top-10 text-muted-foreground font-bold">$</div>
              <input type="number" step="0.01" min="0" value={form.purchasePrice} onChange={(event) => setForm((current) => ({ ...current, purchasePrice: event.target.value }))} placeholder="0.00" className="w-full rounded-xl border border-input bg-background/50 pl-8 pr-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium" required />
            </div>
            
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-foreground">Selling Price</label>
              <div className="absolute left-4 top-10 text-muted-foreground font-bold">$</div>
              <input type="number" step="0.01" min="0" value={form.sellingPrice} onChange={(event) => setForm((current) => ({ ...current, sellingPrice: event.target.value }))} placeholder="0.00" className="w-full rounded-xl border border-input bg-background/50 pl-8 pr-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Initial Stock Quantity</label>
              <input type="number" min="0" value={form.stockQuantity} onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))} placeholder="0" className="w-full rounded-xl border border-input bg-background/50 px-5 py-3.5 outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium" required />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Product Image</label>
              <div className="relative flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-[52px] border-2 border-dashed border-input rounded-xl cursor-pointer bg-background/30 hover:bg-primary/5 hover:border-primary/50 transition-colors overflow-hidden relative group">
                  <div className="flex items-center justify-center gap-2 group-hover:text-primary transition-colors">
                    <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground font-bold group-hover:text-primary transition-colors">{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          
          {imagePreview && (
            <div className="mt-6 p-2 border-2 border-border/50 rounded-2xl bg-background/30 inline-block shadow-sm relative group">
               <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-xl shadow-md" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-[2px]">
                 <span className="text-white text-xs font-bold px-2 py-1 bg-black/50 rounded-md">Preview</span>
               </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-6 mt-2 border-t border-border/50">
            <div className="flex gap-4 w-full sm:w-auto">
              <Button type="submit" disabled={!canSubmit || isSubmitting} className="rounded-xl px-8 py-6 shadow-lg shadow-primary/20 w-full sm:w-auto font-extrabold text-base hover:scale-[1.02] transition-transform active:scale-95 overflow-hidden relative group">
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                <span className="relative z-10">{isSubmitting ? "Processing..." : editingId ? "Save Changes" : "Create Product"}</span>
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl px-8 py-6 font-bold border-2 text-base hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                  Cancel Edit
                </Button>
              ) : null}
            </div>
            
            {message && (
              <div className={`px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-3 shadow-sm border ${message.includes("Unable") ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-green-500/10 text-green-600 border-green-500/20"}`}>
                <CheckCircle2 className="h-5 w-5" /> {message}
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="stagger-animate rounded-2xl border border-border bg-muted/30 p-6 text-center text-muted-foreground font-medium flex items-center justify-center gap-3 shadow-sm">
          <Package className="h-5 w-5" />
          You have view-only access to products. Management requires higher privileges.
        </div>
      )}

      {isLoading ? (
         <div className="flex justify-center py-20 stagger-animate">
           <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
         </div>
      ) : null}
      
      {error ? (
         <div className="stagger-animate p-6 rounded-2xl bg-destructive/10 text-destructive font-bold text-center border border-destructive/20 shadow-sm flex items-center justify-center gap-3">
           <AlertTriangle className="h-5 w-5" />
           Failed to load products. Please check your connection.
         </div>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <div className="stagger-animate p-20 text-center bg-card/40 rounded-3xl border-2 border-dashed border-border flex flex-col items-center">
           <div className="p-6 bg-muted/50 rounded-full mb-6">
             <Package className="h-16 w-16 text-muted-foreground/50" />
           </div>
           <p className="text-2xl font-extrabold text-foreground font-heading">No products found</p>
           <p className="text-muted-foreground mt-2 font-medium text-lg">Try adjusting your search criteria or add a new product to your inventory.</p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="stagger-animate overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/5">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-5 text-left font-extrabold text-muted-foreground uppercase tracking-widest text-[11px]">Product Info</th>
                  <th className="px-6 py-5 text-left font-extrabold text-muted-foreground uppercase tracking-widest text-[11px]">Category</th>
                  <th className="px-6 py-5 text-right font-extrabold text-muted-foreground uppercase tracking-widest text-[11px]">Pricing</th>
                  <th className="px-6 py-5 text-right font-extrabold text-muted-foreground uppercase tracking-widest text-[11px]">Stock Status</th>
                  <th className="px-6 py-5 text-center font-extrabold text-muted-foreground uppercase tracking-widest text-[11px]">Actions</th>
                </tr>
              </thead>
              <tbody ref={tableRef} className="divide-y divide-border/50">
                {items.map((product) => (
                  <tr key={product._id} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-5">
                        {product.productImage ? (
                          <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-sm border border-border shrink-0 bg-background/50 p-0.5 relative group-hover:shadow-md transition-shadow">
                            <img src={product.productImage} alt={product.productName} className="h-full w-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-700" />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0 border border-border shadow-inner">
                             <Package className="h-7 w-7 text-muted-foreground/50" />
                          </div>
                        )}
                        <div>
                          <div className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">{product.productName}</div>
                          <div className="text-xs font-mono font-bold text-muted-foreground mt-1.5 px-2.5 py-1 bg-background border border-border/50 rounded-md inline-block shadow-sm">
                             SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                         {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="font-extrabold text-emerald-500 text-base">${product.sellingPrice.toFixed(2)} <span className="text-[10px] text-muted-foreground font-semibold ml-1 uppercase tracking-wider bg-background px-1.5 py-0.5 rounded border border-border">Sell</span></div>
                      <div className="text-xs text-muted-foreground font-bold mt-2">${product.purchasePrice.toFixed(2)} <span className="text-[10px] font-semibold ml-1 uppercase tracking-wider bg-background px-1.5 py-0.5 rounded border border-border">Buy</span></div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-black shadow-sm border ${product.stockQuantity > 10 ? 'bg-green-500/10 text-green-600 border-green-500/20' : product.stockQuantity > 0 ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                          {product.stockQuantity} Units
                        </span>
                        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest animate-pulse">Low Stock</span>
                        )}
                        {product.stockQuantity === 0 && (
                          <span className="text-[10px] font-black text-destructive uppercase tracking-widest">Out of Stock</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {permissions.canManageProducts ? (
                        <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="h-10 w-10 p-0 rounded-xl bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all shadow-sm hover:scale-110 active:scale-95 border-2">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(product._id)} className="h-10 w-10 p-0 rounded-xl bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all shadow-sm hover:scale-110 active:scale-95 border-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                           <span className="text-xs font-bold text-muted-foreground px-3 py-1 bg-muted rounded-full">Read-only</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {meta && meta.totalPages && meta.totalPages > 1 ? (
        <div className="flex items-center justify-between stagger-animate p-5 bg-card/60 rounded-3xl border border-border backdrop-blur-md shadow-lg shadow-black/5 mt-6">
          <Button variant="outline" className="rounded-xl font-bold shadow-sm border-2 px-6 py-5 hover:bg-primary/5 hover:text-primary transition-colors" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            ← Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-muted px-5 py-2.5 rounded-xl border border-border shadow-inner">
              Page {meta.page ?? page} of {meta.totalPages}
            </span>
          </div>
          <Button variant="outline" className="rounded-xl font-bold shadow-sm border-2 px-6 py-5 hover:bg-primary/5 hover:text-primary transition-colors" disabled={page >= (meta.totalPages ?? page)} onClick={() => setPage((current) => current + 1)}>
            Next →
          </Button>
        </div>
      ) : null}
    </div>
  );
}
