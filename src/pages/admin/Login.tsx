import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin@brototype.com" && password === "admin@2000") {
      toast.success("Admin login successful!");
      navigate("/admin/dashboard");
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6 border-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">ADMIN LOGIN</h1>
          <p className="text-muted-foreground">Administrative access only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@brototype.com"
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
            LOGIN AS ADMIN
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Demo: admin@brototype.com / admin@2000
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

export default AdminLogin;
