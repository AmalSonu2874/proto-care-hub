import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const NewComplaint = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Complaint submitted successfully!");
    navigate("/student/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-foreground p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">BROTOCARE</h1>
          <Button variant="outline" onClick={() => navigate("/student/dashboard")}>
            ← BACK
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">NEW COMPLAINT</h2>
          <p className="text-muted-foreground">Submit a new grievance or concern</p>
        </div>

        <Card className="p-6 border-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Complaint Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary of your complaint"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about your complaint"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="faculty_behaviour">Faculty Behaviour</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, priority: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment">Attachments (Optional)</Label>
              <Input id="attachment" type="file" accept="image/*,.pdf,.doc,.docx" />
              <p className="text-sm text-muted-foreground">Max file size: 10MB</p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" size="lg">
                SUBMIT COMPLAINT
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/student/dashboard")}
                size="lg"
              >
                CANCEL
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default NewComplaint;
