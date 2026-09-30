import { useState, useId } from "react";
import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Wrench,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Send,
  Star,
  MapPin,
  Package,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { service360Service } from "@/services/service360.service";
import type { ServiceRequestTicket, TicketStatus } from "@/types";

export const Route = createFileRoute("/_portal/service-detail/$id")({
  head: () => ({
    meta: [
      { title: "Service Ticket Details | LTL Transformer Portal" },
      { name: "description", content: "Interactive service request discussion, field logs, and verification." },
    ],
  }),
  component: ServiceTicketDetailPage,
});

export function ServiceTicketDetailPage() {
  const { id } = useParams({ from: "/_portal/service-detail/$id" });
  const navigate = useNavigate();
  const feedbackInputId = useId();

  const [ticket, setTicket] = useState<ServiceRequestTicket | undefined>(() =>
    service360Service.getTicketById(id)
  );

  const [replyMessage, setReplyMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  if (!ticket) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Service Ticket Not Found"
          breadcrumb={["LTL Portal", "Service & Maintenance", "Not Found"]}
        />
        <Card className="p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold mb-1">Ticket Not Found</h2>
          <p className="text-xs text-muted-foreground mb-4">
            The requested service ticket does not exist or has been archived.
          </p>
          <Button size="sm" onClick={() => navigate({ to: "/service-requests" })}>
            Return to Service360 Hub
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return <Badge className="bg-sky-500/15 text-sky-600 border border-sky-500/30 dark:text-sky-400">OPEN</Badge>;
      case "acknowledged":
        return <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30 dark:text-amber-400">ACKNOWLEDGED</Badge>;
      case "in_progress":
        return <Badge className="bg-indigo-500/15 text-indigo-600 border border-indigo-500/30 dark:text-indigo-400 animate-pulse">IN PROGRESS</Badge>;
      case "awaiting_customer":
        return <Badge className="bg-orange-500/15 text-orange-600 border border-orange-500/30 dark:text-orange-400">ACTION REQUIRED</Badge>;
      case "resolved":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 dark:text-emerald-400">RESOLVED</Badge>;
      case "closed":
        return <Badge className="bg-muted text-muted-foreground border">CLOSED</Badge>;
    }
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a message before sending.");
      return;
    }

    const updated = service360Service.addMessageToTicket(ticket.id, replyMessage.trim());
    if (updated) {
      setTicket(updated);
      setReplyMessage("");
      toast.success("Reply dispatched to LTL engineering team.");
    }
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast.error("Please select a quality star rating.");
      return;
    }

    const updated = service360Service.closeTicketWithFeedback(
      ticket.id,
      rating,
      feedback.trim() || "Work verified and certified."
    );

    if (updated) {
      setTicket(updated);
      setShowFeedbackForm(false);
      toast.success("Service ticket verified and closed successfully.", {
        description: `Thank you for rating LTL Service (${rating} Stars).`,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/service-requests" })}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Service360 Hub
        </Button>
        <span className="text-xs text-muted-foreground font-mono">
          Ticket Ref: {ticket.ticketId}
        </span>
      </div>

      <PageHeader
        title={`${ticket.ticketId} — ${ticket.equipmentName}`}
        description={`${ticket.category} • Installed at ${ticket.substation}`}
        breadcrumb={["LTL Portal", "Service & Maintenance", ticket.ticketId]}
        actions={
          <div className="flex items-center gap-2">
            {getStatusBadge(ticket.status)}
          </div>
        }
      />

      {/* Meta Grid */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-xs">
        <Card className="p-3.5">
          <p className="text-muted-foreground">Serial & Rating</p>
          <p className="font-semibold text-foreground mt-0.5 font-mono">{ticket.serialNumber}</p>
          <p className="text-[11px] text-muted-foreground">{ticket.model}</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-muted-foreground">Substation & Location</p>
          <p className="font-semibold text-foreground mt-0.5 truncate">{ticket.substation}</p>
          <p className="text-[11px] text-muted-foreground">Province: {ticket.provinceCode}</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-muted-foreground">Assigned Field Specialist</p>
          <p className="font-semibold text-foreground mt-0.5">
            {ticket.technicianAssigned || "Under Dispatch"}
          </p>
          {ticket.technicianPhone && (
            <p className="text-[11px] text-primary">{ticket.technicianPhone}</p>
          )}
        </Card>
        <Card className="p-3.5">
          <p className="text-muted-foreground">Target Field Date</p>
          <p className="font-semibold text-foreground mt-0.5">
            {ticket.scheduledDate || "Scheduling Window"}
          </p>
          <p className="text-[11px] text-muted-foreground">Created: {ticket.createdDate}</p>
        </Card>
      </div>

      {/* Diagnostic Narrative */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          Diagnostic Symptom & Inspection Record
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {ticket.description}
        </p>

        {ticket.imageUrl && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs font-semibold mb-2">Attached Field Photo / Thermal IR:</p>
            <img
              src={ticket.imageUrl}
              alt="Diagnostic attachment"
              className="max-h-64 rounded-lg border shadow-sm"
            />
          </div>
        )}
      </Card>

      {/* Discussion Timeline */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Field Dispatch & Engineering Discussion Thread
          </h3>
          <span className="text-xs text-muted-foreground">
            {ticket.messages.length} messages
          </span>
        </div>

        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {ticket.messages.map((msg) => {
            const isStatus = msg.type === "status_update";
            const isCustomer = msg.sender === "customer";
            return (
              <div
                key={msg.id}
                className={`p-3 rounded-lg text-xs leading-relaxed transition-all ${
                  isStatus
                    ? "bg-sky-500/10 border border-sky-500/25 text-sky-950 dark:text-sky-200"
                    : isCustomer
                    ? "bg-primary/10 border border-primary/25 ml-6 sm:ml-12"
                    : "bg-muted/70 border border-border mr-6 sm:mr-12"
                }`}
              >
                {isStatus ? (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-sky-900 dark:text-sky-300">{msg.senderName}</p>
                      <p className="mt-0.5">{msg.message}</p>
                    </div>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 shrink-0">
                      {msg.timestamp}
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <User className="h-3 w-3 text-primary" />
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <p className="text-foreground/90">{msg.message}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reply Section */}
        {ticket.status !== "closed" && (
          <div className="mt-5 pt-4 border-t space-y-3">
            <label className="text-xs font-semibold text-foreground block">
              Send Update to Assigned LTL Engineers:
            </label>
            <Textarea
              placeholder="Provide updated meter measurements, site access windows, or questions for the field engineer..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={3}
              className="text-xs"
            />
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-muted-foreground">
                All dispatched engineers receive immediate notification.
              </span>
              <Button size="sm" onClick={handleSendReply} className="gap-2 text-xs">
                <Send className="h-3.5 w-3.5" />
                Dispatch Message
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Resolution & Rating Section */}
      {ticket.resolution && (
        <Card className="p-5 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                Engineering Completion Report
              </h4>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {ticket.resolution}
              </p>

              {ticket.rating ? (
                <div className="pt-2 text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">Verified Rating: </span>
                  <span className="text-amber-500 font-bold">
                    {"★".repeat(ticket.rating)}{"☆".repeat(5 - ticket.rating)} ({ticket.rating}/5)
                  </span>
                  {ticket.feedback && (
                    <p className="italic mt-1 text-foreground">"{ticket.feedback}"</p>
                  )}
                </div>
              ) : (
                !showFeedbackForm && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={() => setShowFeedbackForm(true)}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm Resolution & Rate Quality (Close Ticket)
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Interactive Rating Form */}
          {showFeedbackForm && (
            <div className="mt-4 pt-4 border-t border-emerald-500/20 space-y-3">
              <label className="text-xs font-semibold text-foreground block">
                Rate Service Quality (1 to 5 Stars):
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-xs font-bold text-foreground ml-2">
                    {rating} of 5 Stars
                  </span>
                )}
              </div>

              <div>
                <label htmlFor={feedbackInputId} className="text-xs font-semibold text-foreground block mb-1">
                  Engineer Verification Notes / Remarks:
                </label>
                <Textarea
                  id={feedbackInputId}
                  placeholder="Confirm transformer is energized smoothly, voltage stabilized, or any additional remarks..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" onClick={handleSubmitFeedback} className="text-xs">
                  Submit Feedback & Sign Off
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFeedbackForm(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
