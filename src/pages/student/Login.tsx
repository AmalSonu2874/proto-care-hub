import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Demo login
    if (email === "user@brototype.com" && password === "user@2000") {
      toast.success("Login successful!");
      navigate("/student/dashboard");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6 border-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">STUDENT LOGIN</h1>
          <p className="text-muted-foreground">Access your Brotocare account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email / Brotocare ID</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@brototype.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            LOGIN
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Demo: user@brototype.com / user@2000
          </p>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/student/register")}
              className="underline hover:text-foreground"
            >
              Register
            </button>
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-sm underline hover:text-foreground"
          >
            Back to home
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
