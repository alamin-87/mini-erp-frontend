import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { setAuth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, CheckCircle2 } from "lucide-react";
import gsap from "gsap";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    if (leftPanelRef.current) {
      tl.fromTo(
        leftPanelRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
    
    if (rightPanelRef.current) {
      tl.fromTo(
        rightPanelRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
      
      const elements = rightPanelRef.current.querySelectorAll('.stagger-elem');
      tl.fromTo(
        elements,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        "-=0.4"
      );
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", form);
      const auth = response.data.data;
      setAuth(auth);
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => navigate("/", { replace: true })
        });
      } else {
        navigate("/", { replace: true });
      }
    } catch {
      setError("Registration failed. Please try again.");
      setLoading(false);
      if (rightPanelRef.current) {
        gsap.fromTo(rightPanelRef.current, 
          { x: -10 }, 
          { x: 10, duration: 0.1, yoyo: true, repeat: 5, onComplete: () => gsap.set(rightPanelRef.current, { x: 0 }) }
        );
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden items-center justify-center p-6" ref={containerRef}>
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none"></div>
      
      <div className="flex w-full max-w-6xl mx-auto rounded-3xl overflow-hidden glass shadow-2xl border border-white/10 z-10 relative min-h-[700px]">
        
        {/* Left Panel - Branding */}
        <div ref={leftPanelRef} className="hidden lg:flex w-[45%] bg-gradient-to-br from-primary via-primary/90 to-purple-800 p-14 flex-col justify-between relative overflow-hidden text-white shadow-inner">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:24px_24px]"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-16">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 shadow-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-extrabold tracking-tight font-heading">Mini ERP</span>
            </div>
            
            <h1 className="text-5xl font-extrabold leading-tight mb-8">
              Join us to transform your business.
            </h1>
            <p className="text-xl text-white/90 max-w-md leading-relaxed font-medium">
              Create an account and unlock the all-in-one scalable solution for robust inventory management, seamless sales tracking, and comprehensive business analytics.
            </p>
          </div>
          
          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 w-fit">
              <div className="bg-green-400/20 p-1.5 rounded-full">
                <CheckCircle2 className="text-green-300 h-6 w-6" />
              </div>
              <span className="text-lg font-semibold">Real-time inventory tracking</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 w-fit">
              <div className="bg-green-400/20 p-1.5 rounded-full">
                <CheckCircle2 className="text-green-300 h-6 w-6" />
              </div>
              <span className="text-lg font-semibold">Seamless sales management</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 w-fit">
              <div className="bg-green-400/20 p-1.5 rounded-full">
                <CheckCircle2 className="text-green-300 h-6 w-6" />
              </div>
              <span className="text-lg font-semibold">Role-based access control</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Register Form */}
        <div ref={rightPanelRef} className="w-full lg:w-[55%] p-10 md:p-20 flex flex-col justify-center bg-card relative z-10">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-12 stagger-elem">
              <h2 className="text-4xl font-extrabold tracking-tight font-heading mb-3">Create account</h2>
              <p className="text-muted-foreground text-lg">Register to manage your Mini ERP workspace.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="stagger-elem space-y-2">
                <label className="text-sm font-bold text-foreground">Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-xl border border-input bg-background/50 px-5 py-4 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-base"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="stagger-elem space-y-2">
                <label className="text-sm font-bold text-foreground">Email address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-xl border border-input bg-background/50 px-5 py-4 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-base"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div className="stagger-elem space-y-2">
                <label className="text-sm font-bold text-foreground">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="w-full rounded-xl border border-input bg-background/50 px-5 py-4 outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-base"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error ? (
                <div className="stagger-elem p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-bold border border-destructive/20 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
                  {error}
                </div>
              ) : null}

              <Button 
                type="submit" 
                className="stagger-elem w-full py-7 rounded-xl text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 group mt-4 relative overflow-hidden" 
                disabled={loading}
              >
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                {loading ? "Creating account..." : (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    Create account
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="stagger-elem mt-12 text-center pt-8 border-t border-border">
              <p className="text-base text-muted-foreground font-medium">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-primary hover:text-primary/80 transition-colors ml-1">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
