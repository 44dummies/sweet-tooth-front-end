import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const adminEmail = "muindidamian@gmail.com";
      if (session.user.email === adminEmail) {
        navigate("/admin/dashboard");
      } else {
        await supabase.auth.signOut();
        toast.error("Access denied. Admin only.");
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        const adminEmail = "muindidamian@gmail.com";
        if (data.session.user.email !== adminEmail) {
          await supabase.auth.signOut();
          toast.error("Access denied. Admin only.");
          return;
        }
        toast.success("Login successful!");
        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30">
      <div className="bg-card p-8 rounded-2xl shadow-lg border-2 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Sweet Tooth" className="w-20 h-20 mb-4 animate-heartbeat" />
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-muted-foreground text-sm mt-2">Sweet Tooth Bakery</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium mb-2 text-foreground">Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@sweettooth.com"
              className="w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium mb-2 text-foreground">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Contact your administrator if you need access
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
