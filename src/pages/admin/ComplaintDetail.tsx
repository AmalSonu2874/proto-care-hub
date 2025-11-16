import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Complaint = Database["public"]["Tables"]["complaints"]["Row"] & {
  profiles: { first_name: string; last_name: string; student_id: string | null; batch_number: string | null; brotocare_id: string | null } | null;
};
type ComplaintComment = Database["public"]["Tables"]["complaint_comments"]["Row"] & {
  profiles: { first_name: string; last_name: string } | null;
};
type Timeline = Database["public"]["Tables"]["complaint_timeline"]["Row"];

const AdminComplaintDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/admin/login");
    } else if (user) {
      // Verify admin role
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle()
        .then(({ data }) => {
          if (!data) {
            navigate("/admin/login");
          }
        });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchComplaintData();
    }
  }, [user, id]);

  const fetchComplaintData = async () => {
    try {
      // Fetch complaint with student profile
      const { data: complaintData, error: complaintError } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id!)
        .single();

      if (complaintError) throw complaintError;

      // Fetch student profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, student_id, batch_number, brotocare_id')
        .eq('id', complaintData.user_id)
        .single();

      setComplaint({
        ...complaintData,
        profiles: profileData
      });
      setNewStatus(complaintData.status);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('complaint_comments')
        .select('*')
        .eq('complaint_id', id!)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch profiles for comments
      const enrichedComments = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', comment.user_id)
            .single();

          return {
            ...comment,
            profiles: profile
          };
        })
      );

      setComments(enrichedComments as any);

      // Fetch timeline
      const { data: timelineData, error: timelineError } = await supabase
        .from('complaint_timeline')
        .select('*')
        .eq('complaint_id', id!)
        .order('created_at', { ascending: true });

      if (timelineError) throw timelineError;
      setTimeline(timelineData || []);
    } catch (error: any) {
      toast.error("Failed to load complaint details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('complaint_comments')
        .insert({
          complaint_id: id!,
          user_id: user!.id,
          comment: newComment,
          is_admin: true,
        });

      if (error) throw error;

      toast.success("Comment added");
      setNewComment("");
      fetchComplaintData();
    } catch (error: any) {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === complaint?.status) return;

    setSubmitting(true);
    try {
      const updateData: any = {
        status: newStatus,
      };

      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      } else if (newStatus === 'closed') {
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', id!);

      if (error) throw error;

      // Add timeline entry with note if provided
      if (statusNote.trim()) {
        await supabase
          .from('complaint_timeline')
          .insert({
            complaint_id: id!,
            status: newStatus as any,
            note: statusNote,
            created_by: user!.id
          });
      }

      toast.success("Status updated");
      setStatusNote("");
      fetchComplaintData();
    } catch (error: any) {
      toast.error("Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: "bg-muted text-muted-foreground",
      under_review: "bg-accent text-accent-foreground",
      in_process: "bg-foreground text-background",
      resolved: "bg-success text-success-foreground",
      closed: "bg-success text-success-foreground"
    };
    return colors[status as keyof typeof colors] || "bg-muted";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center border-2">
          <p className="text-xl mb-4">Complaint not found</p>
          <Button onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-foreground p-4 sticky top-0 bg-background z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">BROTOCARE ADMIN</h1>
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
            ← BACK
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info */}
            <Card className="p-6 border-2 bg-muted/50">
              <h3 className="text-sm font-bold mb-3">STUDENT INFORMATION</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-bold">{complaint.profiles?.first_name} {complaint.profiles?.last_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Student ID:</span>
                  <p className="font-bold">{complaint.profiles?.student_id || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Batch:</span>
                  <p className="font-bold">{complaint.profiles?.batch_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Brotocare ID:</span>
                  <p className="font-bold">{complaint.profiles?.brotocare_id || 'N/A'}</p>
                </div>
              </div>
            </Card>

            {/* Complaint Details */}
            <Card className="p-6 border-2">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h2 className="text-2xl font-bold">{complaint.title}</h2>
                    <Badge className={getStatusColor(complaint.status)}>
                      {complaint.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                    <span>Category: {complaint.category}</span>
                    <span>•</span>
                    <span>Priority: {complaint.priority.toUpperCase()}</span>
                    <span>•</span>
                    <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-foreground whitespace-pre-wrap">{complaint.description}</p>
              </div>
              {complaint.attachment_url && (
                <div className="border-t pt-4 mt-4">
                  <a
                    href={complaint.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline hover:text-muted-foreground"
                  >
                    View Attachment
                  </a>
                </div>
              )}
            </Card>

            {/* Comments Section */}
            <Card className="p-6 border-2">
              <h3 className="text-xl font-bold mb-4">COMMENTS</h3>
              <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`border-l-2 ${comment.is_admin ? 'border-foreground bg-muted/30' : 'border-border'} pl-4 py-2`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">
                          {comment.is_admin ? "ADMIN" : `${comment.profiles?.first_name || 'Student'} ${comment.profiles?.last_name || ''}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmitComment} className="space-y-4">
                <Textarea
                  placeholder="Add an admin comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  disabled={submitting}
                />
                <Button type="submit" disabled={submitting || !newComment.trim()}>
                  {submitting ? "POSTING..." : "POST ADMIN COMMENT"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Admin Actions - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Update */}
            <Card className="p-6 border-2">
              <h3 className="text-xl font-bold mb-4">UPDATE STATUS</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="in_process">In Process</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">Note (Optional)</Label>
                  <Textarea
                    placeholder="Add a note about this status change..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={3}
                    disabled={submitting}
                  />
                </div>

                <Button 
                  onClick={handleUpdateStatus} 
                  disabled={submitting || newStatus === complaint.status}
                  className="w-full"
                >
                  {submitting ? "UPDATING..." : "UPDATE STATUS"}
                </Button>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6 border-2">
              <h3 className="text-xl font-bold mb-4">TIMELINE</h3>
              <div className="space-y-4">
                {timeline.map((entry, index) => (
                  <div key={entry.id} className="relative">
                    {index !== timeline.length - 1 && (
                      <div className="absolute left-2 top-6 bottom-0 w-px bg-border" />
                    )}
                    <div className="flex gap-3">
                      <div className="w-4 h-4 rounded-full bg-foreground mt-1 relative z-10" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">
                          {entry.status.replace("_", " ").toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleString()}
                        </p>
                        {entry.note && (
                          <p className="text-sm mt-1">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminComplaintDetail;
