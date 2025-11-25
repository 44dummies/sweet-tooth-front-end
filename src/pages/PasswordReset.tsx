import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, ArrowLeft, Mail, AlertCircle } from "lucide-react";
import BackgroundSlider from "@/components/BackgroundSlider";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/logo.png";
import bcrypt from "bcryptjs";

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "password">("email");
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (error || !profile) {
        toast.error("No account found with this email");
        setLoading(false);
        return;
      }

      setUserId(profile.id);
      setStep("password");
      toast.success("Account found! Enter any password you remember using before.");
    } catch (error) {
      toast.error("Error verifying account");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !userId) {
      toast.error("Please enter a password");
      return;
    }

    setLoading(true);

    try {
      const { data: passwordHistory, error: historyError } = await supabase
        .from('password_history')
        .select('password_hash')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      let matchFound = false;
      if (passwordHistory && passwordHistory.length > 0) {
        for (const record of passwordHistory) {
          const isMatch = await bcrypt.compare(password, record.password_hash);
          if (isMatch) {
            matchFound = true;
            break;
          }
        }
      }

      if (!matchFound) {
        toast.error("This password was never used with your account. Please try again or create a new account.");

        const attempts = parseInt(sessionStorage.getItem(`reset_attempts_${userId}`) || '0');
        sessionStorage.setItem(`reset_attempts_${userId}`, String(attempts + 1));

        if (attempts >= 2) {
          toast.error("Too many failed attempts. Your account data will be deleted for security.", {
            duration: 5000,
          });

          await supabase.from('profiles').delete().eq('id', userId);
          await supabase.from('password_history').delete().eq('user_id', userId);
          await supabase.from('customer_data').delete().eq('user_id', userId);

          await supabase.auth.admin.deleteUser(userId).catch(() => {

          });

          sessionStorage.removeItem(`reset_attempts_${userId}`);

          setTimeout(() => {
            navigate("/register");
          }, 2000);
        }

        setLoading(false);
        return;
      }

      toast.success("Password verified! Sending reset link to your email...");

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      sessionStorage.removeItem(`reset_attempts_${userId}`);
      toast.success("Password reset link sent! Check your email.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Reset error:", error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-transparent">
      <BackgroundSlider />
      <div className="w-full max-w-md relative z-10">
        {}
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <img src={logo} alt="Sweet Tooth" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              {step === "email"
                ? "Enter your email to begin password recovery"
                : "Enter any password you've used before to verify your identity"}
            </CardDescription>
          </CardHeader>

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit}>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    We'll verify your identity by checking if you remember any of your previous passwords.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Verifying..." : "Continue"}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset}>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Enter any password you remember using with this account. After 3 failed attempts, your account data will be deleted for security.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Previous Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Any password you used before"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Verifying..." : "Verify Password"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("email")}
                  className="w-full"
                >
                  Change Email
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
