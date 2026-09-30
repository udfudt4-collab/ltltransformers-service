import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  Zap,
  FlaskConical,
  Truck,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Clock,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Calendar,
  Layers,
  Award,
  FileCheck2,
  Sliders,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { service360Service } from "@/services/service360.service";

export const Route = createFileRoute("/_portal/services-hub")({
  head: () => ({
    meta: [
      { title: "Transformer Engineering Services | LTL Operations Portal" },
      { name: "description", content: "World-class transformer engineering services, ISO-17025 accredited oil testing, emergency breakdown response, and full-scope refurbishment." },
    ],
  }),
  component: ServicesHubPage,
});

interface ServiceOffering {
  id: string;
  title: string;
  tagline: string;
  category: string;
  icon: typeof Zap;
  badge: string;
  badgeTone: "emerald" | "sky" | "amber" | "purple";
  description: string;
  turnaroundTime: string;
  accreditation: string;
  highlights: string[];
}

const TOP_SERVICES: ServiceOffering[] = [
  {
    id: "dga-oil-testing",
    title: "DGA & Dielectric Oil Laboratory Testing",
    tagline: "ISO/IEC 17025 Certified Chemical & Diagnostic Laboratory",
    category: "Diagnostics & Testing",
    icon: FlaskConical,
    badge: "Accredited Lab",
    badgeTone: "sky",
    description: "Precision Dissolved Gas Analysis (DGA) using Gas Chromatography, moisture content ppm, dielectric breakdown voltage (BDV), interfacial tension, and furan content to assess paper insulation aging.",
    turnaroundTime: "24 - 48 Hours",
    accreditation: "IEC 60599 / ASTM D3612",
    highlights: [
      "Duval Triangle & Roger's Gas Ratio automated diagnostic reports",
      "Breakdown Voltage (BDV) testing up to 100 kV",
      "Karl Fischer Titration moisture ppm accuracy (< 10 ppm detection)",
      "Digital lab certificate with QR code authenticity",
    ],
  },
  {
    id: "emergency-mobile-filtration",
    title: "24/7 Emergency Mobile Oil Filtration & Degassing",
    tagline: "High-Vacuum On-Site Dehydration & Particle Removal Units",
    category: "Field Operations",
    icon: Truck,
    badge: "24/7 Rapid Dispatch",
    badgeTone: "emerald",
    description: "High-capacity mobile oil conditioning units dispatched directly to primary substations. Restores dielectric strength, extracts dissolved combustible gases, and removes microscopic cellulose particulates under high vacuum without transformer de-tanking.",
    turnaroundTime: "Under 4 Hours Dispatch",
    accreditation: "IEEE C57.106 Compliance",
    highlights: [
      "6,000 LPH High-vacuum two-stage degassing mobile plant",
      "Restores oil dielectric breakdown voltage to > 70 kV",
      "On-line hot oil circulation under active supervision",
      "Emergency diesel generator self-contained trailers",
    ],
  },
  {
    id: "transformer-refurbishment",
    title: "Heavy Transformer Refurbishment & Re-winding",
    tagline: "Factory Overhauling & Core-Coil Reconstruction up to 132 kV",
    category: "Factory Engineering",
    icon: RefreshCw,
    badge: "Life Extension +15 Yrs",
    badgeTone: "purple",
    description: "Complete factory overhaul for damaged or aging grid transformers. Precision high-conductivity electrolytic copper rewinding, core-loss re-annealing, vacuum pressure drying, and upgraded high-durability thermal insulation.",
    turnaroundTime: "2 - 3 Weeks",
    accreditation: "IEC 60076 Factory Tested",
    highlights: [
      "Full factory rewinding with Class H thermal insulation",
      "Core re-lamination & no-load loss optimization",
      "High-pressure leak-proof tank blasting and polyurethane coating",
      "Fresh 24-Month manufacturer warranty reinstated",
    ],
  },
  {
    id: "comprehensive-ama",
    title: "Comprehensive Annual Maintenance Agreements (AMA)",
    tagline: "Total Grid Peace of Mind & Guaranteed Uptime SLA",
    category: "Maintenance Contracts",
    icon: ShieldCheck,
    badge: "99.9% Uptime SLA",
    badgeTone: "emerald",
    description: "All-inclusive preventive and corrective maintenance partnership. Scheduled quarterly thermal imaging inspections, nitrogen capping maintenance, OLTC tap-changer overhauls, and priority technician response with no surprise repair bills.",
    turnaroundTime: "Scheduled Quarterly + 24/7 SLA",
    accreditation: "LTL Platinum Guarantee",
    highlights: [
      "Infrared thermography scanning to catch hotspot degradation early",
      "On-Load Tap Changer (OLTC) mechanism inspection and timing",
      "Free routine oil top-ups and silica gel canister replacement",
      "Dedicated senior power electrical engineering supervisor",
    ],
  },
  {
    id: "smart-iot-telemetry",
    title: "Smart Grid IoT Sensor Retrofit & Telemetry Hub",
    tagline: "Remote SCADA & Real-Time Predictive Health Telemetry",
    category: "Smart Modernization",
    icon: Cpu,
    badge: "Smart Grid Ready",
    badgeTone: "sky",
    description: "Retrofit existing substation transformers with non-invasive IoT telemetry devices. Continuously streams top-oil temperature, ambient delta-T, multi-gas DGA indicators, and vibration signatures directly to the LTL central portal.",
    turnaroundTime: "1 Day Installation",
    accreditation: "Modbus / DNP3 / IEC 61850",
    highlights: [
      "Plug-and-play non-intrusive sensor installation without outage",
      "Cellular 4G/LTE + LoRaWAN dual telemetry transmission",
      "AI-driven predictive anomaly alerts before catastrophic trip",
      "Direct API ingestion into provincial EDL control rooms",
    ],
  },
  {
    id: "energy-audit-losses",
    title: "Grid Energy Audit & Loss Minimization Overhaul",
    tagline: "Maximize Distribution Efficiency & Carbon Reduction",
    category: "Energy Management",
    icon: Sliders,
    badge: "High ROI",
    badgeTone: "amber",
    description: "Comprehensive efficiency evaluation of provincial transformer fleets. Identifies under-loaded, overloaded, and high-loss units to rebalance substation distribution feeders and reduce costly technical transmission losses.",
    turnaroundTime: "5 - 7 Days",
    accreditation: "Certified Energy Auditor (SLSEA)",
    highlights: [
      "Substation load profile curve mapping and harmonic analysis",
      "Phase-balancing solutions to mitigate neutral line overheating",
      "Calculation of lifetime cost of losses vs modernization ROI",
      "Detailed engineering report with prioritized replacement plan",
    ],
  },
];

function ServicesHubPage() {
  const navigate = useNavigate();
  const equipment = service360Service.getEquipment();

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceOffering | null>(null);
  const [bookingEquipmentId, setBookingEquipmentId] = useState("");
  const [substationName, setSubstationName] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [notes, setNotes] = useState("");

  const handleOpenBooking = (service: ServiceOffering) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!substationName.trim()) {
      toast.error("Please specify substation or field location.");
      return;
    }

    toast.success(`Service Booking Confirmed: ${selectedService?.title}!`, {
      description: `Dispatched to LTL Engineering Hub. Priority: ${urgency.toUpperCase()}. Reference #SRV-${Date.now().toString().slice(-5)}.`,
    });

    setIsBookingOpen(false);
    setSubstationName("");
    setNotes("");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header & Overview */}
      <PageHeader
        title="Transformer Engineering & Maintenance Services"
        description="Lanka Transformers Limited (LTL) engineering excellence: certified laboratory diagnostics, emergency rapid-response mobile filtration plants, full-scope rewinding, and smart IoT telemetry retrofits."
        breadcrumb={["LTL Portal", "Engineering Excellence", "Transformer Services"]}
      />

      {/* Emergency Hotline Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-primary to-slate-900 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400 animate-ping" />
              <Badge className="bg-red-500/20 text-red-200 border-red-500/30 text-xs font-semibold">
                24/7 Grid Emergency Command Center
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Immediate Substation Breakdown or Catastrophic Gas Trip?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200/90 max-w-2xl">
              Our mobile oil conditioning teams and high-voltage field diagnostic engineers are standing by for immediate emergency dispatch nationwide.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:+94112434567"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg hover:bg-amber-300 transition-colors"
            >
              <PhoneCall className="h-4 w-4" />
              Emergency Line: +94 11 243 4567
            </a>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 text-xs h-10"
              onClick={() => navigate({ to: "/service-requests" })}
            >
              Open Service Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Accreditation Highlights Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm shadow-xs">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-foreground">ISO/IEC 17025</p>
            <p className="text-[11px] text-muted-foreground">Certified Testing Lab</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm shadow-xs">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-foreground">IEC 60076 &amp; IEEE</p>
            <p className="text-[11px] text-muted-foreground">International Quality</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm shadow-xs">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-foreground">&lt; 4 Hours SLA</p>
            <p className="text-[11px] text-muted-foreground">Emergency Response</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm shadow-xs">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-foreground">24-Month Warranty</p>
            <p className="text-[11px] text-muted-foreground">Factory Guarantee</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {TOP_SERVICES.map((srv) => {
          const Icon = srv.icon;
          return (
            <Card
              key={srv.id}
              className="flex flex-col justify-between transition-all duration-200 hover:border-primary/40 hover:shadow-md group"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold">
                    {srv.badge}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-foreground leading-snug">
                  {srv.title}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-primary mt-0.5">
                  {srv.tagline}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 text-xs space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-muted-foreground leading-relaxed">
                  {srv.description}
                </p>

                {/* Highlights List */}
                <div className="space-y-1.5 border-t pt-3">
                  <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                    Service Capabilities:
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    {srv.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Turnaround & Standard */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 border text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">SLA / Turnaround:</span>
                    <span className="font-semibold text-foreground">{srv.turnaroundTime}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Standard:</span>
                    <span className="font-semibold text-foreground">{srv.accreditation}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    size="sm"
                    className="w-full text-xs gap-1.5 shadow-xs"
                    onClick={() => handleOpenBooking(srv)}
                  >
                    Book This Service
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Booking / Quotation Modal */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Schedule Engineering Service
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedService?.title} ({selectedService?.tagline})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitBooking} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Select Transformer Asset (Optional)</label>
              <Select value={bookingEquipmentId} onValueChange={setBookingEquipmentId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Choose from registered grid assets..." />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id} className="text-xs">
                      {eq.name} ({eq.serialNumber}) - {eq.substation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Substation / Facility Location *</label>
                <Input
                  placeholder="e.g., Kelaniya Primary Substation 04"
                  value={substationName}
                  onChange={(e) => setSubstationName(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Priority SLA Level</label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine" className="text-xs">Routine Maintenance (Standard SLA)</SelectItem>
                    <SelectItem value="urgent" className="text-xs">Urgent / Anomaly Detected (24h)</SelectItem>
                    <SelectItem value="emergency" className="text-xs">Emergency Breakdown (&lt; 4h Dispatch)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Scope Details &amp; Operational Notes</label>
              <Textarea
                placeholder="Specify specific symptoms, oil volume requirements, sampling port access, or outage clearance scheduling..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>An official LTL Engineering Work Order will be generated with SLA tracking.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBookingOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs gap-1.5">
                Confirm &amp; Dispatch Request
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
