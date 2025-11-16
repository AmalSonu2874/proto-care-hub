import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    batchNumber: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [generatedId, setGeneratedId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email.endsWith("@gmail.com")) {
      toast.error("Please use a Gmail address");
      return;
    }

    if (formData.studentId.length !== 6) {
      toast.error("Student ID must be 6 digits");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Generate Brotocare ID
    const year = formData.dobYear;
    const brotocareId = `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}.${year}@brototype.com`;
    
    setGeneratedId(brotocareId);
    setShowSuccess(true);
    toast.success("Registration successful! Check your email for your Brotocare ID");
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 space-y-6 border-2">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">REGISTRATION COMPLETE</h2>
            <div className="p-4 border-2 border-foreground bg-muted">
              <p className="text-sm text-muted-foreground mb-2">Your Brotocare ID:</p>
              <p className="text-lg font-bold break-all">{generatedId}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              This ID has been sent to your Gmail account. Use it to log in.
            </p>
            <Button onClick={() => navigate("/student/login")} className="w-full">
              PROCEED TO LOGIN
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            ← BACK
          </Button>
          <h1 className="text-4xl font-bold mb-2">STUDENT REGISTRATION</h1>
          <p className="text-muted-foreground">Create your Brotocare account</p>
        </div>

        <Card className="p-6 border-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Day"
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={formData.dobDay}
                  onChange={(e) => setFormData({ ...formData, dobDay: e.target.value })}
                />
                <Input
                  placeholder="Month"
                  type="number"
                  min="1"
                  max="12"
                  required
                  value={formData.dobMonth}
                  onChange={(e) => setFormData({ ...formData, dobMonth: e.target.value })}
                />
                <Input
                  placeholder="Year"
                  type="number"
                  min="1980"
                  max="2010"
                  required
                  value={formData.dobYear}
                  onChange={(e) => setFormData({ ...formData, dobYear: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <Input
                  id="batchNumber"
                  required
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID (6 digits) *</Label>
                <Input
                  id="studentId"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Gmail only) *</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="your.email@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              REGISTER
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
