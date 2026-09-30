import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  Package,
  Calendar,
  MapPin,
  FileText,
  ArrowLeft,
  Building,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { service360Service } from "@/services/service360.service";
import { PROVINCES, TRANSFORMER_RATINGS } from "@/mock/provinces";

export const Route = createFileRoute("/_portal/register-warranty")({
  head: () => ({
    meta: [
      { title: "Register Transformer Warranty | LTL Transformer Portal" },
      { name: "description", content: "Activate official Lanka Transformers Limited manufacturer warranty and telemetry monitoring." },
    ],
  }),
  component: RegisterWarrantyPage,
});

export function RegisterWarrantyPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    rating: "500 kVA",
    model: "LTL-PM-500-2024",
    serialNumber: "",
    description: "",
    installationDate: new Date().toISOString().split("T")[0],
    provinceCode: "WP",
    substation: "",
    invoiceNumber: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.serialNumber.trim() || !formData.substation.trim()) {
      toast.error("Please fill in required fields: Transformer Name, Serial Number, and Substation.");
      return;
    }

    const created = service360Service.registerWarranty({
      name: formData.name.trim(),
      rating: formData.rating,
      model: formData.model.trim() || "LTL Standard Unit",
      serialNumber: formData.serialNumber.trim().toUpperCase(),
      description: formData.description.trim() || "Three-Phase Distribution Transformer Unit",
      installationDate: formData.installationDate || new Date().toISOString().slice(0, 10),
      provinceCode: formData.provinceCode,
      substation: formData.substation.trim(),
      invoiceNumber: formData.invoiceNumber.trim() || `INV-LTL-${Date.now().toString().slice(-4)}`,
    });

    toast.success(`Warranty Activated for ${created.name}!`, {
      description: `Registered with serial number ${created.serialNumber}. Valid through ${created.coverageExpiry}.`,
    });

    navigate({ to: "/service-requests" });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
      </div>

      <PageHeader
        title="Register Transformer Warranty"
        description="Activate factory warranty coverage, baseline telemetry, and priority emergency response for newly commissioned grid assets."
        breadcrumb={["LTL Portal", "Service & Maintenance", "Register Warranty"]}
      />

      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Equipment Commissioning Registration
            </h2>
            <p className="text-xs text-muted-foreground">
              Official 24-Month LTL Manufacturer Guarantee
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Transformer Equipment Title *
              </label>
              <Input
                placeholder="e.g., 500 kVA Pole-Mounted Distribution Transformer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                kVA Power Rating *
              </label>
              <Select
                value={formData.rating}
                onValueChange={(val) => setFormData({ ...formData, rating: val })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select kVA rating" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSFORMER_RATINGS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                  <SelectItem value="5000 kVA">5000 kVA (Auto-Transformer)</SelectItem>
                  <SelectItem value="10000 kVA">10 MVA (Grid Substation)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Manufacturer Model Code
              </label>
              <Input
                placeholder="e.g., LTL-PM-500-2024"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Factory Serial Number *
              </label>
              <Input
                placeholder="e.g., LTL-TX-2024-9912"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                required
                className="font-mono text-xs uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Commissioning / Installation Date *
              </label>
              <Input
                type="date"
                value={formData.installationDate}
                onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Provincial Office *
              </label>
              <Select
                value={formData.provinceCode}
                onValueChange={(val) => setFormData({ ...formData, provinceCode: val })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Substation / Installation Feeder *
              </label>
              <Input
                placeholder="e.g., Kelaniya Primary Substation 04"
                value={formData.substation}
                onChange={(e) => setFormData({ ...formData, substation: e.target.value })}
                required
                className="text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                LTL Invoice / Delivery Order Reference
              </label>
              <Input
                placeholder="e.g., INV-LTL-2024-0814"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Technical Specifications & Notes (Optional)
              </label>
              <Textarea
                placeholder="Specify vector group (e.g. Dyn11), tap steps, oil volume, or special ambient protection requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="text-xs"
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/60 p-4 border text-xs space-y-2 text-muted-foreground mt-4">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Warranty Activation Terms
            </h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Warranty period initiates on the recorded commissioning date.</li>
              <li>Includes 24/7 priority breakdown dispatch and genuine OEM parts replacement.</li>
              <li>Quarterly baseline Dissolved Gas Analysis (DGA) record uploaded automatically.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/service-requests" })}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2 text-xs">
              <ShieldCheck className="h-4 w-4" />
              Activate Warranty & Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
