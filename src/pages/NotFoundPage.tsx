import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-4xl font-bold font-heading">404</h2>
      <p className="text-muted-foreground">Page not found.</p>
      <Button asChild>
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  );
}
