import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Complaint = Database["public"]["Tables"]["complaints"]["Row"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/student/login");
    } else if (user) {
      fetchComplaints();
    }
  }, [user, authLoading, navigate]);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error: any) {
      toast.error("Failed to load complaints");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: "bg-muted text-muted-foreground",
      under_review: "bg-accent text-accent-foreground",
      in_process: "bg-foreground text-background",
      resolved: "bg-success text-success-foreground",
      closed: "bg-success text-success-foreground"
    };
    return colors[status];
  };

  const getPriorityBorder = (priority: string) => {
    if (priority === "high") return "border-l-4 border-l-foreground";
    if (priority === "medium") return "border-l-4 border-l-muted-foreground";
    return "border-l-4 border-l-border";
  };

  const activeComplaints = complaints.filter(c => c.status !== "closed" && c.status !== "resolved");
  const closedComplaints = complaints.filter(c => c.status === "closed" || c.status === "resolved");

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-foreground p-4 sticky top-0 bg-background z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">BROTOCARE</h1>
          <Button variant="outline" onClick={handleLogout}>
            LOGOUT
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">MY COMPLAINTS</h2>
            <p className="text-muted-foreground">Track and manage your submissions</p>
          </div>
          <Button onClick={() => navigate("/student/complaint/new")} size="lg">
            + NEW COMPLAINT
          </Button>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ACTIVE ({activeComplaints.length})</h3>
            <div className="grid gap-4">
              {activeComplaints.map((complaint) => (
                <Card
                  key={complaint.id}
                  className={`p-4 cursor-pointer hover:bg-muted transition-colors border-2 ${getPriorityBorder(complaint.priority)}`}
                  onClick={() => navigate(`/student/complaint/${complaint.id}`)}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h4 className="font-bold text-lg">{complaint.title}</h4>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{complaint.description}</p>
                      <div className="flex gap-2 flex-wrap text-sm">
                        <span className="text-muted-foreground">Category: {complaint.category}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">Priority: {complaint.priority.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">CLOSED ({closedComplaints.length})</h3>
            <div className="grid gap-4">
              {closedComplaints.map((complaint) => (
                <Card
                  key={complaint.id}
                  className="p-4 cursor-pointer hover:bg-muted transition-colors border-2 bg-success/5 relative overflow-hidden"
                  onClick={() => navigate(`/student/complaint/${complaint.id}`)}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-success/10 rotate-12 pointer-events-none">
                    SOLVED
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-4 relative">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2 flex-wrap">
                        <h4 className="font-bold text-lg">{complaint.title}</h4>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{complaint.description}</p>
                      <div className="flex gap-2 flex-wrap text-sm">
                        <span className="text-muted-foreground">Category: {complaint.category}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">Priority: {complaint.priority.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
