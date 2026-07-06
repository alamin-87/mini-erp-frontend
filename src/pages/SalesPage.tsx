import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productApi, saleApi, getStoredUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { getRolePermissions } from "@/lib/permissions";
import type { Product } from "@/types/app";

export default function SalesPage() {
  const [selectedProducts, setSelectedProducts] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: "", quantity: 1 },
  ]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const user = getStoredUser();
  const permissions = getRolePermissions(user?.role);

  const { data, isLoading } = useQuery({
    queryKey: ["products-for-sales"],
    queryFn: () => productApi.list({ limit: 100 }),
  });

  const products = (data?.items || []) as Product[];

  const grandTotal = useMemo(() => {
    return selectedProducts.reduce((total, row) => {
      const product = products.find((item) => item._id === row.productId);
      if (!product) return total;
      return total + product.sellingPrice * row.quantity;
    }, 0);
  }, [products, selectedProducts]);

  const updateRow = (index: number, patch: Partial<{ productId: string; quantity: number }>) => {
    setSelectedProducts((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setSelectedProducts((current) => [...current, { productId: "", quantity: 1 }]);
  };

  const removeRow = (index: number) => {
    setSelectedProducts((current) => (current.length === 1 ? [{ productId: "", quantity: 1 }] : current.filter((_, rowIndex) => rowIndex !== index)));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      await saleApi.create({
        items: selectedProducts
          .filter((row) => row.productId)
          .map((row) => ({ product: row.productId, quantity: row.quantity })),
      });
      setMessage("Sale recorded successfully.");
      setSelectedProducts([{ productId: "", quantity: 1 }]);
    } catch {
      setMessage("Unable to create the sale. Check stock and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!permissions.canCreateSales) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        You do not have permission to create sales.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Sale</h2>
        <p className="text-muted-foreground">Select products, enter quantities, and calculate the sale total.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
        {selectedProducts.map((row, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[2fr_1fr_auto]">
            <select
              value={row.productId}
              onChange={(event) => updateRow(index, { productId: event.target.value })}
              className="rounded-lg border border-input bg-background px-3 py-2"
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.productName} — {product.stockQuantity} in stock
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={row.quantity}
              onChange={(event) => updateRow(index, { quantity: Number(event.target.value) })}
              className="rounded-lg border border-input bg-background px-3 py-2"
              required
            />

            <Button type="button" variant="outline" onClick={() => removeRow(index)}>
              Remove
            </Button>
          </div>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={addRow}>
            Add Product
          </Button>

          <div className="text-lg font-semibold">Total: ${grandTotal.toFixed(2)}</div>
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        <Button type="submit" disabled={isSaving || isLoading}>
          {isSaving ? "Saving..." : "Create Sale"}
        </Button>
      </form>
    </div>
  );
}
