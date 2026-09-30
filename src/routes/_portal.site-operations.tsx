import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  MapPin,
  Users,
  Plus,
  Trash2,
  Mail,
  Phone,
  Navigation,
  Save,
  CheckCircle2,
  Building,
  Shield,
  LocateFixed,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { service360Service } from "@/services/service360.service";
import type { SiteOperationLocation, AuthorizedPerson } from "@/types";

export const Route = createFileRoute("/_portal/site-operations")({
  head: () => ({
    meta: [
      { title: "Substation Site & Operations | LTL Transformer Portal" },
      { name: "description", content: "Substation geographical site coordinates, GPS pins, and authorized engineering contacts." },
    ],
  }),
  component: SiteOperationsPage,
});

function SiteOperationsPage() {
  const navigate = useNavigate();
  const [siteLocation, setSiteLocation] = useState<SiteOperationLocation>(() =>
    service360Service.getSiteLocation()
  );

  const [isEditingSite, setIsEditingSite] = useState(false);
  const [siteForm, setSiteForm] = useState({
    substation: siteLocation.substation,
    address: siteLocation.address,
    city: siteLocation.city,
    state: siteLocation.state,
    pincode: siteLocation.pincode,
    latitude: siteLocation.latitude,
    longitude: siteLocation.longitude,
  });

  // Add person dialog state
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "",
  });

  const handleSaveSiteDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = service360Service.updateSiteLocation(siteForm);
    setSiteLocation(updated);
    setIsEditingSite(false);
    toast.success("Substation site coordinates & address saved successfully.");
  };

  const handleGetCurrentLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      toast.info("Requesting GPS hardware fix...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setSiteForm((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));
          toast.success(`Current GPS Coordinates captured: ${lat}, ${lng}`);
        },
        (error) => {
          toast.error("Unable to retrieve GPS coordinates. Please check browser permissions.", {
            description: error.message,
          });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser environment.");
    }
  };

  const handleAddPersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.name.trim() || !newPerson.mobile.trim()) {
      toast.error("Name and mobile phone are required.");
      return;
    }

    const updated = service360Service.addAuthorizedPerson({
      name: newPerson.name.trim(),
      email: newPerson.email.trim() || "ops@edl.lk",
      mobile: newPerson.mobile.trim(),
      designation: newPerson.designation.trim() || "Operations Contact",
    });

    setSiteLocation(updated);
    setIsAddPersonOpen(false);
    setNewPerson({ name: "", email: "", mobile: "", designation: "" });
    toast.success(`${newPerson.name} added to authorized personnel list.`);
  };

  const handleRemovePerson = (id: number, name: string) => {
    const updated = service360Service.removeAuthorizedPerson(id);
    setSiteLocation(updated);
    toast.info(`Removed ${name} from authorized personnel.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Substation Site & Authorized Personnel"
        description="Verify geographical GPS telemetry, emergency access coordinates, and primary contact engineers for LTL field dispatch."
        breadcrumb={["LTL Portal", "Service & Maintenance", "Site & Operations"]}
        actions={
          <Button
            size="sm"
            variant={isEditingSite ? "outline" : "default"}
            onClick={() => {
              if (isEditingSite) {
                setSiteForm({
                  substation: siteLocation.substation,
                  address: siteLocation.address,
                  city: siteLocation.city,
                  state: siteLocation.state,
                  pincode: siteLocation.pincode,
                  latitude: siteLocation.latitude,
                  longitude: siteLocation.longitude,
                });
              }
              setIsEditingSite(!isEditingSite);
            }}
            className="text-xs"
          >
            {isEditingSite ? "Cancel Editing" : "Edit Substation Coordinates"}
          </Button>
        }
      />

      {/* Substation Location Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4 pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {siteLocation.substation}
              </h2>
              <p className="text-xs text-muted-foreground">
                Province: {siteLocation.provinceCode} • GPS High-Precision Coordinates
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
            Active Hub
          </Badge>
        </div>

        {isEditingSite ? (
          <form onSubmit={handleSaveSiteDetails} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold text-foreground mb-1 block">
                  Substation Name *
                </label>
                <Input
                  value={siteForm.substation}
                  onChange={(e) => setSiteForm({ ...siteForm, substation: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-foreground mb-1 block">
                  Street Address *
                </label>
                <Input
                  value={siteForm.address}
                  onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">City</label>
                <Input
                  value={siteForm.city}
                  onChange={(e) => setSiteForm({ ...siteForm, city: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Postal Code</label>
                <Input
                  value={siteForm.pincode}
                  onChange={(e) => setSiteForm({ ...siteForm, pincode: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  GPS Latitude (e.g. 6.9553)
                </label>
                <Input
                  value={siteForm.latitude}
                  onChange={(e) => setSiteForm({ ...siteForm, latitude: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  GPS Longitude (e.g. 79.9224)
                </label>
                <Input
                  value={siteForm.longitude}
                  onChange={(e) => setSiteForm({ ...siteForm, longitude: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetCurrentLocation}
                className="gap-2 text-xs"
              >
                <LocateFixed className="h-4 w-4 text-primary" />
                Capture Current GPS Location
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingSite(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1.5 text-xs">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">Address:</span>
                <span className="font-semibold text-foreground mt-0.5 block">{siteLocation.address}</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">City & Postal:</span>
                <span className="font-semibold text-foreground mt-0.5 block">{siteLocation.city}, {siteLocation.pincode}</span>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">GPS Coordinates:</span>
                <span className="font-semibold text-foreground mt-0.5 block font-mono">
                  {siteLocation.latitude}° N, {siteLocation.longitude}° E
                </span>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg border">
                <span className="text-muted-foreground block text-[11px]">Fleet Navigation:</span>
                <a
                  href={`https://maps.google.com/?q=${siteLocation.latitude},${siteLocation.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  View on Satellite
                  <Navigation className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Authorized Personnel Directory */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Authorized Personnel & Dispatch Contacts
              </h2>
              <p className="text-xs text-muted-foreground">
                Engineers permitted to sign off transformer work, line clearances, and inspection reports.
              </p>
            </div>
          </div>

          <Dialog open={isAddPersonOpen} onOpenChange={setIsAddPersonOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs">
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Add Authorized Personnel
                </DialogTitle>
                <DialogDescription>
                  Enter official contact details for substation coordination and emergency notifications.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddPersonSubmit} className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Full Name *</label>
                  <Input
                    placeholder="e.g., Eng. Sunil Alwis"
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                    required
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Official Designation</label>
                  <Input
                    placeholder="e.g., Senior Electrical Engineer / Feeder Lead"
                    value={newPerson.designation}
                    onChange={(e) => setNewPerson({ ...newPerson, designation: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Direct Mobile Phone *</label>
                  <Input
                    placeholder="+94 77 123 4567"
                    value={newPerson.mobile}
                    onChange={(e) => setNewPerson({ ...newPerson, mobile: e.target.value })}
                    required
                    className="text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Email Address</label>
                  <Input
                    type="email"
                    placeholder="sunil.a@edl.lk"
                    value={newPerson.email}
                    onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAddPersonOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm">
                    Add Personnel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {siteLocation.authorizedPersons.map((person) => (
            <div
              key={person.id}
              className="p-3.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground text-sm">{person.name}</p>
                  {person.designation && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {person.designation}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground mt-1 text-[11px]">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3 text-primary" />
                    {person.mobile}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-primary" />
                    {person.email}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemovePerson(person.id, person.name)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 self-end sm:self-center"
                title="Remove contact"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {siteLocation.authorizedPersons.length === 0 && (
            <p className="text-center py-6 text-xs text-muted-foreground">
              No authorized personnel recorded. Add your site engineers for automated dispatch updates.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
