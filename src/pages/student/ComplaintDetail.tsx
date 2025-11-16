import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
type ComplaintComment = Database["public"]["Tables"]["complaint_comments"]["Row"] & {
  profiles: { first_name: string; last_name: string } | null;
};
type Timeline = Database["public"]["Tables"]["complaint_timeline"]["Row"];

const ComplaintDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/student/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchComplaintData();
    }
  }, [user, id]);

  const fetchComplaintData = async () => {
    try {
      // Fetch complaint
      const { data: complaintData, error: complaintError } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single();

      if (complaintError) throw complaintError;
      setComplaint(complaintData);

      // Fetch comments with profile info
      const { data: commentsData, error: commentsError } = await supabase
        .from('complaint_comments')
        .select('*')
        .eq('complaint_id', id!)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      
      // Fetch profiles separately
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
          is_admin: false,
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
          <Button onClick={() => navigate("/student/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-foreground p-4 sticky top-0 bg-background z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">BROTOCARE</h1>
          <Button variant="outline" onClick={() => navigate("/student/dashboard")}>
            ← BACK
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Details */}
            <Card className="p-6 border-2">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{complaint.title}</h2>
                    <Badge className={getStatusColor(complaint.status)}>
                      {complaint.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
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
                    <div key={comment.id} className="border-l-2 border-foreground pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">
                          {comment.is_admin ? "ADMIN" : `${comment.profiles?.first_name || 'User'} ${comment.profiles?.last_name || ''}`}
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
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  disabled={submitting}
                />
                <Button type="submit" disabled={submitting || !newComment.trim()}>
                  {submitting ? "POSTING..." : "POST COMMENT"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Timeline - Right Side */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-2 sticky top-24">
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

export default ComplaintDetail;
