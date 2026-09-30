import { useState, useId } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Wrench,
  Package,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  ShieldCheck,
  Calendar,
  ChevronDown,
  Upload,
  ArrowRight,
  PhoneCall,
  User,
  ExternalLink,
  Flame,
  HelpCircle,
  FileText,
  MapPin,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { service360Service } from "@/services/service360.service";
import { SERVICE_CATEGORIES } from "@/mock/service-data";
import type { ServiceRequestTicket, EquipmentAsset, TicketStatus } from "@/types";

export const Route = createFileRoute("/_portal/service-requests")({
  head: () => ({
    meta: [
      { title: "Service360 & Maintenance | LTL Transformer Portal" },
      {
        name: "description",
        content: "Enterprise transformer service requests, field engineering tickets, and warranty lifecycle tracking.",
      },
      { property: "og:title", content: "Service360 & Maintenance | LTL Transformer Portal" },
      { property: "og:description", content: "Transformer diagnostic tickets, field engineer dispatch, and warranty telemetry." },
    ],
  }),
  component: ServiceRequestsPage,
});

export function ServiceRequestsPage() {
  const navigate = useNavigate();
  const fileInputId = useId();
  const [activeTab, setActiveTab] = useState<string>("tickets");
  const [tickets, setTickets] = useState<ServiceRequestTicket[]>(() => service360Service.getTickets());
  const [equipmentList, setEquipmentList] = useState<EquipmentAsset[]>(() => service360Service.getEquipment());
  
  // Filters & search
  const [ticketSearch, setTicketSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  // New Ticket Form State
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newProductId, setNewProductId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Active tickets alert banner
  const [showOngoingAlert, setShowOngoingAlert] = useState(true);
  const ongoingTickets = tickets.filter((t) => t.status === "in_progress" || t.status === "open" || t.status === "awaiting_customer");

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketId.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.equipmentName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.serialNumber.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.substation.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEquipment = equipmentList.filter((e) =>
    e.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
    e.model.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
    e.serialNumber.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
    e.substation.toLowerCase().includes(equipmentSearch.toLowerCase())
  );

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

  const getCoverageBadge = (type: string, status: string) => {
    const label = type === "warranty" ? "Warranty" : type === "ama" ? "AMA Contract" : "No Coverage";
    if (status === "active") {
      return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400">{label}</Badge>;
    }
    if (status === "expiring") {
      return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400">{label} (Expiring)</Badge>;
    }
    return <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 dark:text-rose-400">Expired</Badge>;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductId || !newCategory || !newDescription.trim()) {
      toast.error("Please fill in all required fields (Equipment, Category, Issue Description).");
      return;
    }

    const created = service360Service.createTicket({
      equipmentId: newProductId,
      category: newCategory,
      description: newDescription.trim(),
      ...(uploadedImage ? { imageUrl: uploadedImage } : {}),
    });

    setTickets(service360Service.getTickets());
    setIsNewTicketOpen(false);
    setNewProductId("");
    setNewCategory("");
    setNewDescription("");
    setUploadedImage(null);

    toast.success(`Service Request ${created.ticketId} Created!`, {
      description: "Assigned to LTL Field Engineering team for immediate review.",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="LTL Service360 — Maintenance & Warranty"
        description="Unified transformer diagnostic tickets, field engineering dispatches, warranty registrations, and substation asset telemetry."
        breadcrumb={["LTL Portal", "Service & Maintenance", "Service360 Hub"]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/register-warranty" })}
              className="gap-2"
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
              Register Warranty
            </Button>
            <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Service Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                    <Wrench className="h-5 w-5 text-primary" />
                    Create Maintenance Service Request
                  </DialogTitle>
                  <DialogDescription>
                    Submit transformer breakdown or diagnostic request directly to Lanka Transformers Limited engineers.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateTicketSubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Target Transformer Unit *
                    </label>
                    <Select value={newProductId} onValueChange={setNewProductId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select installed transformer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {equipmentList.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id}>
                            {eq.name} ({eq.serialNumber}) — {eq.substation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Maintenance / Fault Category *
                    </label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select maintenance category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Diagnostic Symptoms & Description *
                    </label>
                    <Textarea
                      placeholder="Detail dielectric oil readings, unusual hums, leakage points, Buchholz relay signals, or ambient conditions..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">
                      Site Photo / Thermal Scan Attachment (Optional)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-lg p-5 text-center hover:border-primary/60 transition-colors cursor-pointer bg-muted/20">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id={fileInputId}
                      />
                      <label htmlFor={fileInputId} className="cursor-pointer block">
                        {uploadedImage ? (
                          <div className="space-y-2">
                            <img
                              src={uploadedImage}
                              alt="Upload preview"
                              className="max-h-40 mx-auto rounded border shadow-sm"
                            />
                            <p className="text-xs text-emerald-600 font-medium">Image attached successfully</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                            <p className="text-sm font-medium text-foreground">Click or drop transformer photo</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, Thermal IR up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1 border">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      LTL Service SLA Guarantee:
                    </p>
                    <p>• Emergency tripping & critical leaks: Initial dispatch within 4 hours.</p>
                    <p>• Planned oil filtration & condition monitoring: Mobilization within 48 hours.</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsNewTicketOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit Request</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Field Tickets"
          value={String(ongoingTickets.length)}
          hint="Mobilization & on-site actions"
          icon={Wrench}
          tone="warning"
        />
        <StatCard
          label="Monitored Transformers"
          value={String(equipmentList.length)}
          hint="Covered under LTL warranty / AMA"
          icon={Package}
          tone="info"
        />
        <StatCard
          label="Resolved Quality Rate"
          value="98.4%"
          hint="First-time issue resolution score"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Customer Satisfaction"
          value="4.9 / 5.0"
          hint="Based on provincial engineer reviews"
          icon={Shield}
          tone="default"
        />
      </div>

      {/* Ongoing Alert Banner */}
      {ongoingTickets.length > 0 && showOngoingAlert && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                You have {ongoingTickets.length} active service ticket{ongoingTickets.length > 1 ? "s" : ""} in progress
              </p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
                Latest: {ongoingTickets[0]?.ticketId} — {ongoingTickets[0]?.category} ({ongoingTickets[0]?.equipmentName})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-amber-500/40 text-xs bg-background/50 hover:bg-background"
              onClick={() => {
                setActiveTab("tickets");
                if (ongoingTickets[0]) {
                  setExpandedTicketId(ongoingTickets[0].id);
                }
              }}
            >
              Inspect First
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-amber-700 hover:text-amber-900 dark:text-amber-300"
              onClick={() => setShowOngoingAlert(false)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="tickets" className="text-xs">
            Service Tickets ({tickets.length})
          </TabsTrigger>
          <TabsTrigger value="equipment" className="text-xs">
            Asset Catalog ({equipmentList.length})
          </TabsTrigger>
          <TabsTrigger value="support" className="text-xs">
            Support & SLA
          </TabsTrigger>
        </TabsList>

        {/* -------------------- TAB 1: SERVICE TICKETS -------------------- */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ticket ID, transformer, substation..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44 h-9 text-xs">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses ({tickets.length})</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="awaiting_customer">Action Required</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const isExpanded = expandedTicketId === ticket.id;
              return (
                <Card
                  key={ticket.id}
                  className={`transition-all duration-200 hover:border-primary/40 ${
                    isExpanded ? "border-primary/50 shadow-sm" : ""
                  }`}
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                          <Wrench className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-foreground text-sm tracking-tight">
                              {ticket.ticketId}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="font-semibold text-foreground text-sm truncate">
                              {ticket.equipmentName}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {ticket.serialNumber}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                            <span className="font-medium text-foreground/80">{ticket.category}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {ticket.substation}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {ticket.createdDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {getStatusBadge(ticket.status)}
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expanded Ticket Details */}
                    {isExpanded && (
                      <div
                        className="mt-4 pt-4 border-t border-border space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-xs">
                          <div className="p-2.5 rounded-lg bg-muted/50 border">
                            <p className="text-muted-foreground">Technician In-Charge</p>
                            <p className="font-semibold text-foreground mt-0.5">
                              {ticket.technicianAssigned || "Queueing Dispatch"}
                            </p>
                            {ticket.technicianPhone && (
                              <p className="text-[11px] text-primary">{ticket.technicianPhone}</p>
                            )}
                          </div>
                          <div className="p-2.5 rounded-lg bg-muted/50 border">
                            <p className="text-muted-foreground">Scheduled Field Visit</p>
                            <p className="font-semibold text-foreground mt-0.5">
                              {ticket.scheduledDate || "Under Planning"}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-muted/50 border">
                            <p className="text-muted-foreground">Latest Message Count</p>
                            <p className="font-semibold text-foreground mt-0.5">
                              {ticket.messages.length} dispatch entries
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-muted/50 border">
                            <p className="text-muted-foreground">Resolution Sign-off</p>
                            <p className="font-semibold text-foreground mt-0.5">
                              {ticket.completedDate || (ticket.status === "closed" ? "Closed" : "Pending completion")}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-muted/30 rounded-lg border text-xs">
                          <p className="font-semibold text-foreground mb-1">Issue Narrative:</p>
                          <p className="text-muted-foreground leading-relaxed">{ticket.description}</p>
                        </div>

                        {ticket.resolution && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs">
                            <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              Resolution Summary:
                            </p>
                            <p className="text-emerald-950 dark:text-emerald-100">{ticket.resolution}</p>
                            {ticket.rating && (
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold">
                                <span>Quality Score: {ticket.rating} / 5 Stars ★</span>
                                {ticket.feedback && <span className="font-normal italic">"{ticket.feedback}"</span>}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <p className="text-xs text-muted-foreground">
                            Last communication: {ticket.messages[ticket.messages.length - 1]?.timestamp}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => navigate({ to: `/service-detail/${ticket.id}` })}
                            className="gap-1.5 text-xs"
                          >
                            Open Discussion & Timeline
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}

            {filteredTickets.length === 0 && (
              <Card className="p-12 text-center">
                <Wrench className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-base mb-1">No Matching Tickets Found</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Adjust your search keyword or create a new transformer service request.
                </p>
                <Button size="sm" onClick={() => setIsNewTicketOpen(true)}>
                  Create Service Ticket
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* -------------------- TAB 2: EQUIPMENT CATALOG -------------------- */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transformer model, kVA rating, serial number..."
                value={equipmentSearch}
                onChange={(e) => setEquipmentSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button
              size="sm"
              onClick={() => navigate({ to: "/register-warranty" })}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Register New Transformer
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEquipment.map((eq) => (
              <Card key={eq.id} className="flex flex-col justify-between hover:border-primary/40 transition-colors">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-semibold text-foreground line-clamp-1">
                        {eq.name}
                      </CardTitle>
                      <CardDescription className="text-xs font-mono mt-0.5">
                        {eq.serialNumber} • {eq.rating}
                      </CardDescription>
                    </div>
                    {getCoverageBadge(eq.coverageType, eq.coverageStatus)}
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 text-xs space-y-3 flex-1">
                  <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                    {eq.description}
                  </p>

                  <div className="space-y-1 text-muted-foreground border-t pt-2">
                    <div className="flex justify-between">
                      <span>Model:</span>
                      <span className="font-medium text-foreground">{eq.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Substation:</span>
                      <span className="font-medium text-foreground truncate max-w-[180px]">{eq.substation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Installation Date:</span>
                      <span className="font-medium text-foreground">{eq.installationDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coverage Expiry:</span>
                      <span className="font-medium text-foreground">{eq.coverageExpiry}</span>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => navigate({ to: `/transformer/${eq.id}` as any })}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Asset 360°
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => {
                        setNewProductId(eq.id);
                        setIsNewTicketOpen(true);
                      }}
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      Request Service
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* -------------------- TAB 3: SUPPORT & SLA -------------------- */}
        <TabsContent value="support" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 flex flex-col justify-between">
              <div>
                <div className="rounded-lg bg-red-500/10 p-2.5 w-fit text-red-600 mb-3">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm">24/7 Grid Emergency Line</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  For immediate substation tripping, explosions, catastrophic oil fire, or high-voltage hazard.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t">
                <a
                  href="tel:+94112434567"
                  className="font-mono text-sm font-bold text-red-600 hover:underline block"
                >
                  +94 11 243 4567 / ext. 101
                </a>
                <span className="text-[10px] text-muted-foreground">National Grid Emergency Desk</span>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between">
              <div>
                <div className="rounded-lg bg-primary/10 p-2.5 w-fit text-primary mb-3">
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm">Mobile Oil Filtration Fleet</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  High-capacity mobile vacuum degassing plants capable of treating 6,000 L/hour on energized substations.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t">
                <p className="text-xs font-semibold text-foreground">Depot Readiness: 100%</p>
                <span className="text-[10px] text-muted-foreground">Colombo, Kandy, Galle, Anuradhapura</span>
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between">
              <div>
                <div className="rounded-lg bg-emerald-500/10 p-2.5 w-fit text-emerald-600 mb-3">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm">Substation Operations Site</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Manage geographical coordinates, GPS pins, and authorized personnel for your primary hub.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => navigate({ to: "/site-operations" })}
                >
                  Manage Site & Personnel
                </Button>
              </div>
            </Card>
          </div>

          {/* SLA & FAQs Accordion */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-1">
              Transformer Maintenance Protocols & Warranty Terms
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Standard operating procedures for Lanka Transformers Limited field response and warranty claims.
            </p>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xs font-semibold">
                  What is covered under the Standard LTL Transformer Warranty?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  LTL provides a 24-month manufacturer warranty from commissioning date covering core and winding
                  integrity, dielectric insulation, tank sealing, and factory-assembled tap changer mechanisms.
                  Damage due to external lightning surges without installed surge arresters or severe unbalance
                  exceeding IEC 60076 standards requires engineering assessment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-xs font-semibold">
                  What is the procedure for Emergency Oil Filtration?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  When oil dielectric breakdown voltage (BDV) drops below 30 kV or moisture content exceeds 25 ppm,
                  raise a ticket under "Oil Filtration & Purification". Our mobile trailer-mounted vacuum dehydrator
                  will be deployed to your substation within 24–48 hours. Both online and offline treatment options are supported.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-xs font-semibold">
                  How does Annual Maintenance Agreement (AMA) renewal work?
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  AMA coverage includes quarterly Dissolved Gas Analysis (DGA), silica gel breather regeneration,
                  annual thermographic inspection, and priority mobilization without separate call-out charges.
                  Renewal reminders are triggered 60 days before contract expiry.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
