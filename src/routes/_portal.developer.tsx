import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Code2,
  Terminal,
  Key,
  Copy,
  Check,
  Webhook,
  Database,
  Cpu,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  Send,
  ShieldCheck,
  FileCode2,
  Server,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_portal/developer")({
  head: () => ({
    meta: [
      { title: "Developer & API Integration Hub | LTL Transformer Portal" },
      { name: "description", content: "Developer APIs, SCADA webhooks, SAP HANA Service Layer integration, and SDK endpoints for grid operations." },
    ],
  }),
  component: DeveloperHubPage,
});

interface EndpointDef {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  summary: string;
  category: string;
  sampleBody?: string;
  sampleResponse: string;
}

const ENDPOINTS: EndpointDef[] = [
  {
    method: "GET",
    path: "/api/v1/transformers",
    summary: "Query registered grid transformer assets with telemetry health and warranty status.",
    category: "Assets",
    sampleResponse: `[
  {
    "id": "eq-001",
    "name": "500 kVA Pole-Mounted Distribution Transformer",
    "serialNumber": "LTL-TX-2023-8841",
    "rating": "500 kVA",
    "substation": "Kelaniya Primary Substation 04",
    "provinceCode": "WP",
    "coverageType": "warranty",
    "coverageStatus": "active",
    "coverageExpiry": "2026-04-20",
    "telemetry": {
      "oilTemperatureC": 58,
      "loadPercentage": 74,
      "bdvKilovolts": 62,
      "dgaStatus": "NORMAL"
    }
  }
]`,
  },
  {
    method: "POST",
    path: "/api/v1/telemetry",
    summary: "Ingest live SCADA sensor readings (top-oil temperature, BDV, vibration, load factor).",
    category: "Telemetry Ingestion",
    sampleBody: `{
  "serialNumber": "LTL-TX-2023-8841",
  "oilTemperatureC": 62.4,
  "loadPercentage": 78.1,
  "bdvKilovolts": 60.5,
  "gasLevels": {
    "hydrogenPpm": 12,
    "methanePpm": 5,
    "acetylenePpm": 0
  },
  "timestamp": "2026-09-30T17:30:00Z"
}`,
    sampleResponse: `{
  "status": "ACCEPTED",
  "anomalyDetected": false,
  "healthIndex": 94.2,
  "acknowledgedAt": "2026-09-30T17:30:01.042Z"
}`,
  },
  {
    method: "POST",
    path: "/api/v1/service-requests",
    summary: "Create urgent diagnostic ticket and alert on-call field engineering supervisors.",
    category: "Service360",
    sampleBody: `{
  "equipmentId": "eq-001",
  "category": "High Top-Oil Temperature Alert",
  "priority": "emergency",
  "description": "Temperature gauge surpassed 85C threshold during peak evening industrial feeder surge."
}`,
    sampleResponse: `{
  "ticketId": "TKT-2026-104",
  "status": "open",
  "dispatched": true,
  "slaEstimatedResponseHours": 4,
  "assignedTeam": "Western Province Emergency Dispatch Unit"
}`,
  },
  {
    method: "POST",
    path: "/api/v1/auth/verify-otp",
    summary: "Validate 6-digit SMS OTP against SAP HANA service layer customer database.",
    category: "Authentication",
    sampleBody: `{
  "phone": "+94771234567",
  "otp": "123456"
}`,
    sampleResponse: `{
  "accessToken": "ltl_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Eng. Wickramasinghe",
    "role": "EDL_PROVINCIAL_ENGINEER",
    "provinceCode": "WP"
  }
}`,
  },
];

function DeveloperHubPage() {
  const [apiKey, setApiKey] = useState("ltl_live_sk_948f93e0b2494df8a51a5b2ae2002aea");
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [codeLang, setCodeLang] = useState<"curl" | "ts" | "py">("curl");
  const [webhookUrl, setWebhookUrl] = useState("https://edl-scada.ceb.lk/api/hooks/ltl-telemetry");
  const [testingWebhook, setTestingWebhook] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    toast.success("API Key Copied to Clipboard!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRotateKey = () => {
    const newKey = `ltl_live_sk_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
    setApiKey(newKey);
    toast.success("New API Key Generated!");
  };

  const handleTestWebhook = () => {
    setTestingWebhook(true);
    setTimeout(() => {
      setTestingWebhook(false);
      toast.success("Webhook Test Dispatched (200 OK)", {
        description: `Delivered sample EVENT_TRANSFORMER_TRIP to ${webhookUrl}`,
      });
    }, 800);
  };

  const getCodeSnippet = (ep: EndpointDef, lang: "curl" | "ts" | "py") => {
    const fullUrl = `http://localhost:8080${ep.path}`;
    if (lang === "curl") {
      if (ep.method === "GET") {
        return `curl -X GET "${fullUrl}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"`;
      }
      return `curl -X POST "${fullUrl}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${ep.sampleBody?.replace(/\n/g, "")}'`;
    }

    if (lang === "ts") {
      if (ep.method === "GET") {
        return `import axios from "axios";

const response = await axios.get("${fullUrl}", {
  headers: {
    Authorization: "Bearer ${apiKey}",
  },
});
console.log(response.data);`;
      }
      return `import axios from "axios";

const payload = ${ep.sampleBody};

const response = await axios.post("${fullUrl}", payload, {
  headers: {
    Authorization: "Bearer ${apiKey}",
    "Content-Type": "application/json",
  },
});
console.log(response.data);`;
    }

    // Python
    if (ep.method === "GET") {
      return `import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer ${apiKey}"
}

response = requests.get(url, headers=headers)
print(response.json())`;
    }
    return `import requests

url = "${fullUrl}"
payload = ${ep.sampleBody}
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <PageHeader
        title="Developer & API Integration Hub"
        description="Comprehensive developer resources for power grid engineers, SCADA telemetry streaming, SAP HANA Service Layer bridges, and webhook integrations."
        breadcrumb={["LTL Portal", "Developer Tools", "API Integration Hub"]}
      />

      {/* Developer API Key Manager Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/[0.02]">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                Live Grid Access Credentials
              </CardTitle>
              <CardDescription className="text-xs">
                Use your production bearer token to authenticate SCADA telemetry sensors and automated dispatch systems.
              </CardDescription>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs w-fit">
              API Status: Online (99.98% SLA)
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0 text-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Input
                readOnly
                value={apiKey}
                className="font-mono text-xs bg-muted/60 pr-10 h-10 select-all"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyKey}
              className="gap-1.5 text-xs h-10 shrink-0"
            >
              {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedKey ? "Copied!" : "Copy Key"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRotateKey}
              className="text-xs h-10 shrink-0"
            >
              Regenerate
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Include this token in the <code className="font-mono text-foreground font-semibold">Authorization: Bearer &lt;KEY&gt;</code> header of your requests.
          </p>
        </CardContent>
      </Card>

      {/* Grid: Interactive Endpoint Explorer & Code Generator */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Endpoint Catalog List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            API Endpoints (v1.2 REST)
          </h3>
          <div className="space-y-2">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <div
                  key={`${ep.method}-${ep.path}`}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        ep.method === "GET"
                          ? "bg-sky-500/20 text-sky-600 dark:text-sky-400"
                          : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-semibold text-foreground truncate">
                      {ep.path}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-1">{ep.summary}</p>
                </div>
              );
            })}
          </div>

          {/* Quick System Telemetry Metrics */}
          <Card className="p-4 mt-4 space-y-2.5 text-xs">
            <p className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
              <Activity className="h-3.5 w-3.5 text-primary" />
              API Gateway Metrics
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-muted/50 border">
                <span className="text-muted-foreground block text-[10px]">Average Latency</span>
                <span className="font-bold font-mono text-emerald-600">38 ms</span>
              </div>
              <div className="p-2 rounded bg-muted/50 border">
                <span className="text-muted-foreground block text-[10px]">Ingestion Rate</span>
                <span className="font-bold font-mono text-primary">1.4k req/sec</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Code Generator & Live Response */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="p-5 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs font-bold uppercase">
                      {selectedEndpoint.method}
                    </Badge>
                    <CardTitle className="text-sm sm:text-base font-mono font-bold text-foreground">
                      {selectedEndpoint.path}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {selectedEndpoint.summary}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg self-start sm:self-auto">
                  <Button
                    size="sm"
                    variant={codeLang === "curl" ? "default" : "ghost"}
                    className="h-7 px-2.5 text-[11px]"
                    onClick={() => setCodeLang("curl")}
                  >
                    cURL
                  </Button>
                  <Button
                    size="sm"
                    variant={codeLang === "ts" ? "default" : "ghost"}
                    className="h-7 px-2.5 text-[11px]"
                    onClick={() => setCodeLang("ts")}
                  >
                    TypeScript
                  </Button>
                  <Button
                    size="sm"
                    variant={codeLang === "py" ? "default" : "ghost"}
                    className="h-7 px-2.5 text-[11px]"
                    onClick={() => setCodeLang("py")}
                  >
                    Python
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4 text-xs">
              {/* Request Code Block */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase font-mono">
                    Code Request Sample ({codeLang})
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getCodeSnippet(selectedEndpoint, codeLang));
                      toast.success("Snippet Copied!");
                    }}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Code
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-border/40 leading-relaxed">
                  <code>{getCodeSnippet(selectedEndpoint, codeLang)}</code>
                </pre>
              </div>

              {/* Sample Response */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase font-mono">
                  Sample JSON Response (200 OK)
                </span>
                <pre className="p-3.5 rounded-xl bg-slate-900/90 text-emerald-400 font-mono text-xs overflow-x-auto border border-border/40 max-h-64 leading-relaxed">
                  <code>{selectedEndpoint.sampleResponse}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Stream Configuration */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Webhook className="h-4 w-4 text-primary" />
                Substation Event Webhooks
              </CardTitle>
              <CardDescription className="text-xs">
                Receive instant POST notifications when a transformer trips, top-oil temp alerts trigger, or warranty status transitions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="font-mono text-xs h-9"
                  placeholder="https://your-server.com/webhooks/ltl"
                />
                <Button
                  size="sm"
                  onClick={handleTestWebhook}
                  disabled={testingWebhook}
                  className="text-xs gap-1.5 h-9 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                  {testingWebhook ? "Sending..." : "Test Ping"}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Supported Events:</span>
                <Badge variant="outline" className="text-[10px] font-mono">TRANSFORMER_TRIP</Badge>
                <Badge variant="outline" className="text-[10px] font-mono">OIL_TEMP_HIGH</Badge>
                <Badge variant="outline" className="text-[10px] font-mono">DGA_GAS_ANOMALY</Badge>
                <Badge variant="outline" className="text-[10px] font-mono">TICKET_DISPATCHED</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
