import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b-2 border-foreground p-4">
        <h1 className="text-2xl font-bold tracking-tight">BROTOCARE</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
              GRIEVANCE MANAGEMENT
            </h2>
            <p className="text-xl text-muted-foreground font-mono">
              Fast. Transparent. Trackable.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              onClick={() => navigate("/student/login")}
              size="lg"
              className="text-lg h-14"
            >
              STUDENT LOGIN
            </Button>
            <Button
              onClick={() => navigate("/admin/login")}
              variant="outline"
              size="lg"
              className="text-lg h-14"
            >
              ADMIN LOGIN
            </Button>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground">
              New student?{" "}
              <button
                onClick={() => navigate("/student/register")}
                className="underline hover:text-foreground transition-colors"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-foreground p-4 text-center text-sm text-muted-foreground">
        © 2025 Brototype. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
