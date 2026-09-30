import { useState } from "react";
import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Wrench,
  Shield,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Package,
  FileText,
  Activity,
  Zap,
  Phone,
  Mail,
  Download,
  ExternalLink,
  ChevronRight,
  Flame,
  Gauge,
  Sliders,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { service360Service } from "@/services/service360.service";
import { SERVICE_CATEGORIES } from "@/mock/service-data";
import type { EquipmentAsset, ServiceRequestTicket, CoverageType, CoverageStatus } from "@/types";

export const Route = createFileRoute("/_portal/transformer/$id")({
  head: () => ({
    meta: [
      { title: "Transformer 360° Asset Profile | LTL Transformer Portal" },
      { name: "description", content: "Comprehensive high-voltage transformer asset lifecycle, warranty coverage, telemetry, and service ticket history." },
    ],
  }),
  component: TransformerDetailPage,
});

function TransformerDetailPage() {
  const { id } = useParams({ from: "/_portal/transformer/$id" });
  const navigate = useNavigate();

  const allEquipment = service360Service.getEquipment();
  const asset: EquipmentAsset | undefined =
    service360Service.getEquipmentById(id) || allEquipment[0];

  const allTickets = service360Service.getTickets();
  const assetTickets = allTickets.filter(
    (t) =>
      t.equipmentId === asset?.id ||
      t.serialNumber === asset?.serialNumber ||
      t.equipmentName.toLowerCase().includes(asset?.name.toLowerCase() || "")
  );

  // New Ticket Dialog State
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");

  // Warranty Certificate Modal
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  if (!asset) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/service-requests" })}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Service Hub
        </Button>
        <Card className="p-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-bold">Transformer Not Found</h2>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Could not locate transformer with identifier &quot;{id}&quot;.
          </p>
          <Button size="sm" onClick={() => navigate({ to: "/service-requests" })}>
            View Registered Assets
          </Button>
        </Card>
      </div>
    );
  }

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !ticketDescription.trim()) {
      toast.error("Please select a diagnostic category and enter a problem description.");
      return;
    }

    const newTicket = service360Service.createTicket({
      equipmentId: asset.id,
      category: selectedCategory,
      description: ticketDescription.trim(),
    });

    toast.success(`Service Ticket ${newTicket.ticketId} Created!`, {
      description: "Our emergency field engineering team has been alerted.",
    });

    setIsTicketOpen(false);
    setSelectedCategory("");
    setTicketDescription("");
  };

  const getCoverageBadge = (type: CoverageType, status: CoverageStatus) => {
    if (type === "none" || status === "expired") {
      return (
        <Badge variant="outline" className="border-red-500/40 text-red-600 bg-red-500/10 text-xs px-2.5 py-0.5">
          Warranty Expired
        </Badge>
      );
    }
    if (status === "expiring") {
      return (
        <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10 text-xs px-2.5 py-0.5">
          Expiring Soon (AMA Renewal Due)
        </Badge>
      );
    }
    if (type === "ama") {
      return (
        <Badge variant="outline" className="border-blue-500/40 text-blue-600 bg-blue-500/10 text-xs px-2.5 py-0.5">
          Active AMA Covered
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 bg-emerald-500/10 text-xs px-2.5 py-0.5">
        Factory Warranty Active
      </Badge>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/service-requests" })}
          className="gap-2 text-xs w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Service &amp; Maintenance
        </Button>

        {/* Quick Switcher across grid transformers */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Switch Transformer:</span>
          <Select
            value={asset.id}
            onValueChange={(val) => navigate({ to: `/transformer/${val}` as any })}
          >
            <SelectTrigger className="h-8 text-xs w-[240px]">
              <SelectValue placeholder="Select Asset" />
            </SelectTrigger>
            <SelectContent>
              {allEquipment.map((eq) => (
                <SelectItem key={eq.id} value={eq.id} className="text-xs">
                  {eq.serialNumber} - {eq.rating}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Asset Header Card */}
      <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-primary/[0.03]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Zap className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {asset.name}
                </h1>
                {getCoverageBadge(asset.coverageType, asset.coverageStatus)}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                  SN: {asset.serialNumber}
                </span>
                <span>•</span>
                <span className="font-semibold text-foreground">{asset.rating}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {asset.substation} ({asset.provinceCode})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => setIsCertModalOpen(true)}
            >
              <Download className="h-3.5 w-3.5" />
              Warranty Certificate
            </Button>

            <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 text-xs">
                  <Wrench className="h-3.5 w-3.5" />
                  Request Field Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-primary" />
                    Dispatch Service: {asset.serialNumber}
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Log an urgent field service ticket for {asset.name} at {asset.substation}.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateTicket} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Service Diagnostic Category *</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select diagnosis category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-xs">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Incident / Failure Details *</label>
                    <Textarea
                      placeholder="Describe symptoms: tripping indicators, oil temperature rise, unusual hum, sparking, or maintenance inspection requirement..."
                      rows={4}
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTicketOpen(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="text-xs">
                      Submit Ticket
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* Grid: 360 Telemetry & Lifecycle */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Col 1 & 2: Technical Specs & Lifecycle Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lifecycle & Warranty Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Asset Lifecycle &amp; Coverage Timeline
              </CardTitle>
              <CardDescription className="text-xs">
                Manufacturing, energization milestones, and service contract validity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {/* Milestone 1 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 h-4 w-4 rounded-full bg-emerald-500/20 border-2 border-emerald-600 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">Manufactured &amp; Factory Certified</p>
                      <span className="text-[11px] text-muted-foreground font-mono">{asset.purchaseDate}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Assembled at LTL Transformers Colombo facility under ISO 9001:2015 &amp; IEC 60076 standards.
                    </p>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 h-4 w-4 rounded-full bg-emerald-500/20 border-2 border-emerald-600 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">Substation Commissioning &amp; Energization</p>
                      <span className="text-[11px] text-muted-foreground font-mono">{asset.installationDate}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Energized at {asset.substation}. Transformer telemetry linked to central supervisory control.
                    </p>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0.5 h-4 w-4 rounded-full flex items-center justify-center ${
                    asset.coverageStatus === "expired"
                      ? "bg-red-500/20 border-2 border-red-600"
                      : "bg-primary/20 border-2 border-primary"
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${
                      asset.coverageStatus === "expired" ? "bg-red-600" : "bg-primary"
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground">
                        {asset.coverageType === "ama" ? "Annual Maintenance Agreement (AMA)" : "Official LTL Warranty"}
                      </p>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Valid until {asset.coverageExpiry}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {asset.coverageStatus === "active"
                        ? "Active coverage includes scheduled oil dielectric testing, 24-hr breakdown engineer dispatch, and original parts replacement."
                        : asset.coverageStatus === "expiring"
                        ? "Attention: Warranty renewal window open. Transition to LTL Comprehensive Annual Maintenance Agreement (AMA)."
                        : "Coverage elapsed. Asset operating under customer self-maintenance protocol."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Technical Nameplate &amp; Electrical Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <p className="text-muted-foreground">Power Rating</p>
                  <p className="font-semibold text-foreground mt-0.5">{asset.rating}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <p className="text-muted-foreground">Equipment Model</p>
                  <p className="font-semibold text-foreground mt-0.5">{asset.model}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <p className="text-muted-foreground">Voltage Ratio</p>
                  <p className="font-semibold text-foreground mt-0.5">33 kV / 415 V</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <p className="text-muted-foreground">Cooling System</p>
                  <p className="font-semibold text-foreground mt-0.5">ONAN (Oil Natural Air Natural)</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <p className="text-muted-foreground">Vector Group</p>
                  <p className="font-semibold text-foreground mt-0.5">Dyn11 (Three Phase)</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <p className="text-muted-foreground">Invoice Reference</p>
                  <p className="font-semibold text-foreground mt-0.5 font-mono">{asset.invoiceNumber}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t text-xs">
                <p className="text-muted-foreground mb-1 font-medium">Design &amp; Engineering Description:</p>
                <p className="text-foreground/90 leading-relaxed bg-muted/20 p-2.5 rounded-lg border">
                  {asset.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Associated Service Tickets */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  Service &amp; Maintenance History ({assetTickets.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Field engineering tickets logged for this specific asset.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 h-8"
                onClick={() => setIsTicketOpen(true)}
              >
                Log Ticket
              </Button>
            </CardHeader>
            <CardContent>
              {assetTickets.length > 0 ? (
                <div className="space-y-2.5">
                  {assetTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground font-mono">{t.ticketId}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-medium text-foreground truncate">{t.category}</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-1">{t.description}</p>
                        <p className="text-[11px] text-muted-foreground">Logged: {t.createdDate}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {t.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => navigate({ to: `/service-detail/${t.id}` as any })}
                        >
                          Details
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border rounded-lg bg-muted/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-foreground">Clean Maintenance Record</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    No active failures or open tickets logged for this unit.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Col 3: Real-Time Diagnostic Gauge & Grid Custody */}
        <div className="space-y-6">
          {/* Real-time Health Telemetry */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Live Health Diagnostics
              </CardTitle>
              <CardDescription className="text-xs">
                Sensors &amp; dielectric state metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metric 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Top-Oil Temperature</span>
                  <span className="font-semibold text-foreground">58°C (Normal)</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "52%" }} />
                </div>
                <span className="text-[10px] text-muted-foreground">Trip threshold: 85°C</span>
              </div>

              {/* Metric 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Substation Peak Load</span>
                  <span className="font-semibold text-foreground">74% capacity</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "74%" }} />
                </div>
                <span className="text-[10px] text-muted-foreground">Rating: {asset.rating}</span>
              </div>

              {/* Metric 3 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Oil Breakdown Voltage (BDV)</span>
                  <span className="font-semibold text-foreground">62 kV (IEC Passed)</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "88%" }} />
                </div>
                <span className="text-[10px] text-muted-foreground">Min acceptable: 40 kV</span>
              </div>

              {/* Silica Gel & Buchholz */}
              <div className="pt-2 border-t space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Silica Gel Breather</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                    Deep Blue (Dry)
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Buchholz Relay</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                    No Gas Trip
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Substation & Custody Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Custody &amp; Substation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <p className="text-muted-foreground">Station Assignment</p>
                <p className="font-semibold text-foreground mt-0.5">{asset.substation}</p>
                <p className="text-[11px] text-muted-foreground">EDL Province: {asset.provinceCode}</p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-muted-foreground">Managing Customer / Utility</p>
                <p className="font-semibold text-foreground mt-0.5">{asset.customerName || "Ceylon Electricity Board / EDL"}</p>
              </div>

              {asset.customerPhone && (
                <div className="flex items-center gap-2 pt-1 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{asset.customerPhone}</span>
                </div>
              )}

              {asset.customerEmail && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>{asset.customerEmail}</span>
                </div>
              )}

              <div className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                  onClick={() => navigate({ to: "/site-operations" })}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  View Site Coordinates &amp; Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Official Warranty Certificate Preview Modal */}
      <Dialog open={isCertModalOpen} onOpenChange={setIsCertModalOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-primary to-slate-900 p-6 text-white text-center relative">
            <div className="inline-flex p-3 rounded-full bg-white/10 mb-2">
              <ShieldCheck className="h-8 w-8 text-amber-300" />
            </div>
            <h2 className="text-lg font-bold tracking-wider uppercase">Lanka Transformers Limited</h2>
            <p className="text-xs text-white/80 mt-0.5">Official Manufacturer Warranty &amp; Telemetry Assurance</p>
          </div>

          <div className="p-6 space-y-4 text-xs bg-card">
            <div className="border-b pb-3 text-center">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-mono">Certificate Of Compliance</p>
              <h3 className="text-base font-bold text-foreground mt-1">{asset.name}</h3>
              <p className="text-xs font-mono text-primary font-semibold mt-0.5">SN: {asset.serialNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border">
              <div>
                <span className="text-muted-foreground block text-[10px]">Power Rating:</span>
                <span className="font-semibold text-foreground">{asset.rating}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Installed Substation:</span>
                <span className="font-semibold text-foreground">{asset.substation}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Energization Date:</span>
                <span className="font-semibold text-foreground">{asset.installationDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Warranty Valid Through:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {asset.coverageExpiry}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center italic">
              Certified under IEC 60076 standards. Guarantees coil insulation integrity, core losses, and on-site engineering SLA for 24 months from commissioning.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setIsCertModalOpen(false)}
              >
                Close
              </Button>
              <Button
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => {
                  window.print();
                  toast.success("Printing Warranty Certificate...");
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
