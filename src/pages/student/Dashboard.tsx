import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ComplaintStatus = "submitted" | "under_review" | "in_process" | "resolved" | "closed";

interface Complaint {
  id: string;
  title: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: ComplaintStatus;
  date: string;
  description: string;
}

const mockComplaints: Complaint[] = [
  {
    id: "1",
    title: "Hostel WiFi not working",
    category: "Infrastructure",
    priority: "high",
    status: "in_process",
    date: "2025-01-15",
    description: "WiFi has been down for 3 days"
  },
  {
    id: "2",
    title: "Need access to additional study materials",
    category: "Academic",
    priority: "medium",
    status: "under_review",
    date: "2025-01-14",
    description: "Requesting DSA practice problems"
  },
  {
    id: "3",
    title: "Classroom AC not working",
    category: "Infrastructure",
    priority: "low",
    status: "closed",
    date: "2025-01-10",
    description: "Fixed on Jan 12"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [complaints] = useState<Complaint[]>(mockComplaints);

  const getStatusColor = (status: ComplaintStatus) => {
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-foreground p-4 sticky top-0 bg-background z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">BROTOCARE</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
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
                      {new Date(complaint.date).toLocaleDateString()}
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
                      {new Date(complaint.date).toLocaleDateString()}
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
