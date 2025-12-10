import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Leaf, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, staffLogin } = useAuth();
  const isSignup = searchParams.get("signup") === "true";
  const [mode, setMode] = useState<"signin" | "signup">(isSignup ? "signup" : "signin");
  const [loginType, setLoginType] = useState<"user" | "staff">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const getDashboardPath = (role: string) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "farmer":
        return "/dashboard";
      case "buyer":
        return "/buyer";
      case "delivery":
        return "/delivery";
      case "warehouse":
        return "/warehouse";
      default:
        return "/";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let success = false;

      if (mode === "signin") {
        if (loginType === "staff") {
          success = await staffLogin(email, password);
        } else {
          success = await login(email, password);
        }
      } else {
        success = await login(email, password);
      }

      if (success) {
        toast.success(mode === "signin" ? "Welcome back!" : "Account created successfully!", {
          description: "You can now access your dashboard.",
        });

        // Get the user to determine dashboard path
        const user = useAuth.getState().user;
        if (user) {
          setTimeout(() => {
            navigate(getDashboardPath(user.role));
          }, 500);
        }
      } else {
        toast.error("Invalid credentials", {
          description: "Please check your email and password.",
        });
      }
    } catch (error) {
      toast.error("Sign in failed", {
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-muted/20 py-12">
        <div className="container px-4 max-w-md">
          <Card variant="elevated" className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-hero">
                  <Leaf className="h-6 w-6 text-primary-foreground" />
                </div>
              </Link>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {mode === "signin" ? "Welcome back" : "Create an account"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {mode === "signin"
                  ? "Sign in to access your account"
                  : "Join Ghana's largest farm marketplace"}
              </p>
            </div>

            {/* Login Type Tabs - Sign In Only */}
            {mode === "signin" && (
              <div className="mb-6 flex gap-2 border border-border rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLoginType("user")}
                  className={`flex-1 py-2 px-3 rounded font-medium transition-colors ${
                    loginType === "user"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  User Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("staff")}
                  className={`flex-1 py-2 px-3 rounded font-medium transition-colors ${
                    loginType === "staff"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Staff Login
                </button>
              </div>
            )}

            {/* Demo Credentials Notice */}
            {mode === "signin" && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                <strong>Demo Credentials:</strong>
                {loginType === "user" ? (
                  <ul className="mt-2 space-y-1 font-mono text-xs">
                    <li>Admin: admin@test.com / admin123</li>
                    <li>Farmer: farmer@test.com / farmer123</li>
                    <li>Buyer: buyer@test.com / buyer123</li>
                    <li>Delivery: delivery@test.com / delivery123</li>
                    <li>Warehouse: warehouse@test.com / warehouse123</li>
                  </ul>
                ) : (
                  <p className="mt-2 text-xs">
                    Use the credentials assigned by the admin through the Staff Management page.
                  </p>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="userType">I am a...</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" className="h-auto py-4 flex-col gap-2">
                      <span className="text-lg">🛒</span>
                      <span>Buyer</span>
                    </Button>
                    <Button type="button" variant="outline" className="h-auto py-4 flex-col gap-2">
                      <span className="text-lg">🌾</span>
                      <span>Farmer</span>
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  "Please wait..."
                ) : mode === "signin" ? (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground">or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" type="button">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" type="button">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>

            {/* Toggle Mode */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-primary font-medium hover:underline"
                    onClick={() => setMode("signup")}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-primary font-medium hover:underline"
                    onClick={() => setMode("signin")}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
