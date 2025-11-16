import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ComplaintStatus = "submitted" | "under_review" | "in_process" | "resolved" | "closed";

interface Complaint {
  id: string;
  studentName: string;
  studentId: string;
  batchNumber: string;
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
    studentName: "John Doe",
    studentId: "123456",
    batchNumber: "B24",
    title: "Hostel WiFi not working",
    category: "Infrastructure",
    priority: "high",
    status: "in_process",
    date: "2025-01-15",
    description: "WiFi has been down for 3 days"
  },
  {
    id: "2",
    studentName: "Jane Smith",
    studentId: "234567",
    batchNumber: "B23",
    title: "Need access to additional study materials",
    category: "Academic",
    priority: "medium",
    status: "under_review",
    date: "2025-01-14",
    description: "Requesting DSA practice problems"
  },
  {
    id: "3",
    studentName: "Bob Johnson",
    studentId: "345678",
    batchNumber: "B24",
    title: "Classroom AC not working",
    category: "Infrastructure",
    priority: "low",
    status: "closed",
    date: "2025-01-10",
    description: "Fixed on Jan 12"
  }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [complaints] = useState<Complaint[]>(mockComplaints);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const filteredComplaints = complaints.filter(c => {
    if (filterCategory !== "all" && c.category.toLowerCase() !== filterCategory) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterPriority !== "all" && c.priority !== filterPriority) return false;
    return true;
  });

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

  const stats = {
    total: complaints.length,
    active: complaints.filter(c => c.status !== "closed" && c.status !== "resolved").length,
    resolved: complaints.filter(c => c.status === "resolved" || c.status === "closed").length,
    high: complaints.filter(c => c.priority === "high").length
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-foreground p-4 sticky top-0 bg-background z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">BROTOCARE ADMIN</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            LOGOUT
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">COMPLAINT MANAGEMENT</h2>
          <p className="text-muted-foreground">Monitor and resolve student grievances</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-2">
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
            <div className="text-sm text-muted-foreground">TOTAL</div>
          </Card>
          <Card className="p-4 border-2">
            <div className="text-3xl font-bold mb-1">{stats.active}</div>
            <div className="text-sm text-muted-foreground">ACTIVE</div>
          </Card>
          <Card className="p-4 border-2">
            <div className="text-3xl font-bold mb-1">{stats.resolved}</div>
            <div className="text-sm text-muted-foreground">RESOLVED</div>
          </Card>
          <Card className="p-4 border-2">
            <div className="text-3xl font-bold mb-1">{stats.high}</div>
            <div className="text-sm text-muted-foreground">HIGH PRIORITY</div>
          </Card>
        </div>

        <Card className="p-4 border-2 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm mb-2 block">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="faculty behaviour">Faculty Behaviour</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="in_process">In Process</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm mb-2 block">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <Card
              key={complaint.id}
              className={`p-4 cursor-pointer hover:bg-muted transition-colors border-2 ${getPriorityBorder(complaint.priority)}`}
              onClick={() => navigate(`/admin/complaint/${complaint.id}`)}
            >
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 flex-wrap mb-2">
                      <h4 className="font-bold text-lg">{complaint.title}</h4>
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{complaint.description}</p>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(complaint.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-4 flex-wrap text-sm border-t pt-3">
                  <span><strong>Student:</strong> {complaint.studentName}</span>
                  <span><strong>ID:</strong> {complaint.studentId}</span>
                  <span><strong>Batch:</strong> {complaint.batchNumber}</span>
                  <span><strong>Category:</strong> {complaint.category}</span>
                  <span><strong>Priority:</strong> {complaint.priority.toUpperCase()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={className}>{children}</label>
);

export default AdminDashboard;
