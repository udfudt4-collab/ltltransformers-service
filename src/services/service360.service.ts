import type {
  EquipmentAsset,
  ServiceRequestTicket,
  ServiceTicketMessage,
  SiteOperationLocation,
  AuthorizedPerson,
} from "@/types";
import {
  INITIAL_EQUIPMENT_ASSETS,
  INITIAL_SERVICE_TICKETS,
  INITIAL_SITE_LOCATION,
} from "@/mock/service-data";

const EQUIPMENT_KEY = "ltl_service360_equipment";
const TICKETS_KEY = "ltl_service360_tickets";
const SITE_KEY = "ltl_service360_site";

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }
}

export const service360Service = {
  // Equipment assets
  getEquipment(): EquipmentAsset[] {
    return getStored<EquipmentAsset[]>(EQUIPMENT_KEY, INITIAL_EQUIPMENT_ASSETS);
  },

  getEquipmentById(id: string): EquipmentAsset | undefined {
    const list = this.getEquipment();
    return list.find((e) => e.id === id || e.serialNumber === id);
  },

  registerWarranty(data: {
    name: string;
    rating: string;
    model: string;
    serialNumber: string;
    description: string;
    installationDate: string;
    provinceCode: string;
    substation: string;
    invoiceNumber: string;
  }): EquipmentAsset {
    const list = this.getEquipment();
    const purchaseDate = new Date(data.installationDate);
    purchaseDate.setDate(purchaseDate.getDate() - 10);
    const purchaseDateStr = purchaseDate.toISOString().slice(0, 10);

    const expiryDate = new Date(data.installationDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years warranty
    const expiryDateStr = expiryDate.toISOString().slice(0, 10);

    const newAsset: EquipmentAsset = {
      id: `eq-${Date.now()}`,
      name: data.name,
      rating: data.rating,
      model: data.model,
      serialNumber: data.serialNumber,
      description: data.description || "LTL High-Performance Transformer unit",
      provinceCode: data.provinceCode || "WP",
      substation: data.substation || "Provincial Transformer Station",
      purchaseDate: purchaseDateStr,
      installationDate: data.installationDate,
      coverageType: "warranty",
      coverageStatus: "active",
      coverageExpiry: expiryDateStr,
      invoiceNumber: data.invoiceNumber || `INV-LTL-${Date.now().toString().slice(-4)}`,
    };

    const updated = [newAsset, ...list];
    setStored(EQUIPMENT_KEY, updated);
    return newAsset;
  },

  // Service Request Tickets
  getTickets(): ServiceRequestTicket[] {
    return getStored<ServiceRequestTicket[]>(TICKETS_KEY, INITIAL_SERVICE_TICKETS);
  },

  getTicketById(id: string): ServiceRequestTicket | undefined {
    const tickets = this.getTickets();
    return tickets.find((t) => t.id === id || t.ticketId === id);
  },

  createTicket(data: {
    equipmentId: string;
    category: string;
    description: string;
    imageUrl?: string | undefined;
  }): ServiceRequestTicket {
    const equipment = this.getEquipmentById(data.equipmentId);
    const tickets = this.getTickets();
    const count = tickets.length + 1;
    const ticketId = `TKT-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;

    const newTicket: ServiceRequestTicket = {
      id: `tkt-${Date.now()}`,
      ticketId,
      equipmentId: data.equipmentId,
      equipmentName: equipment?.name || "Transformer Unit",
      model: equipment?.model || "Standard Model",
      serialNumber: equipment?.serialNumber || "SN-UNKNOWN",
      category: data.category,
      status: "open",
      description: data.description,
      provinceCode: equipment?.provinceCode || "WP",
      substation: equipment?.substation || "Substation Hub",
      createdDate: new Date().toISOString().slice(0, 10),
      imageUrl: data.imageUrl,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "customer",
          senderName: "Operations Officer",
          message: data.description,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "message",
        },
        {
          id: `msg-${Date.now() + 1}`,
          sender: "ltl",
          senderName: "LTL Service360 Dispatch",
          message: `Ticket ${ticketId} created and registered in priority queue. Engineering supervisor notified.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: "status_update",
        },
      ],
    };

    const updated = [newTicket, ...tickets];
    setStored(TICKETS_KEY, updated);
    return newTicket;
  },

  addMessageToTicket(
    ticketId: string,
    messageText: string,
    sender: "customer" | "technician" | "ltl" = "customer",
    senderName = "Operations Officer"
  ): ServiceRequestTicket | undefined {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticketId || t.ticketId === ticketId);
    if (index === -1) return undefined;

    const ticket = tickets[index];
    if (!ticket) return undefined;

    const newMessage: ServiceTicketMessage = {
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      message: messageText,
      timestamp: new Date().toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "message",
    };

    const updatedTicket: ServiceRequestTicket = {
      ...ticket,
      messages: [...ticket.messages, newMessage],
      status: ticket.status === "open" ? "in_progress" : ticket.status,
    };

    tickets[index] = updatedTicket;
    setStored(TICKETS_KEY, tickets);
    return updatedTicket;
  },

  closeTicketWithFeedback(
    ticketId: string,
    rating: number,
    feedback: string
  ): ServiceRequestTicket | undefined {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id === ticketId || t.ticketId === ticketId);
    if (index === -1) return undefined;

    const ticket = tickets[index];
    if (!ticket) return undefined;

    const feedbackMsg: ServiceTicketMessage = {
      id: `msg-${Date.now()}`,
      sender: "customer",
      senderName: "Customer Sign-off",
      message: `Ticket resolved and verified. Quality Score: ${rating}/5 Stars. Review: ${feedback}`,
      timestamp: new Date().toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "message",
    };

    const updatedTicket: ServiceRequestTicket = {
      ...ticket,
      status: "closed",
      completedDate: new Date().toISOString().slice(0, 10),
      rating,
      feedback,
      messages: [...ticket.messages, feedbackMsg],
    };

    tickets[index] = updatedTicket;
    setStored(TICKETS_KEY, tickets);
    return updatedTicket;
  },

  // Site Profile Location & Contacts
  getSiteLocation(): SiteOperationLocation {
    return getStored<SiteOperationLocation>(SITE_KEY, INITIAL_SITE_LOCATION);
  },

  updateSiteLocation(data: Partial<SiteOperationLocation>): SiteOperationLocation {
    const current = this.getSiteLocation();
    const updated = { ...current, ...data };
    setStored(SITE_KEY, updated);
    return updated;
  },

  addAuthorizedPerson(person: Omit<AuthorizedPerson, "id">): SiteOperationLocation {
    const current = this.getSiteLocation();
    const newPerson: AuthorizedPerson = {
      id: Math.max(0, ...current.authorizedPersons.map((p) => p.id)) + 1,
      ...person,
    };
    const updated = {
      ...current,
      authorizedPersons: [...current.authorizedPersons, newPerson],
    };
    setStored(SITE_KEY, updated);
    return updated;
  },

  removeAuthorizedPerson(id: number): SiteOperationLocation {
    const current = this.getSiteLocation();
    const updated = {
      ...current,
      authorizedPersons: current.authorizedPersons.filter((p) => p.id !== id),
    };
    setStored(SITE_KEY, updated);
    return updated;
  },
};
