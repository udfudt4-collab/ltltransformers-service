import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Pencil, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type Column } from "@/components/common/data-table";
import { ExportMenu } from "@/components/common/export-menu";
import { FilterBar } from "@/components/common/filter-bar";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status-badge";
import { useAuth } from "@/app/auth-context";
import { CURRENT_PERIOD, MONTHS, TRANSFORMER_RATINGS } from "@/mock/provinces";
import type { CrudService } from "@/services/crud.factory";
import type { QueryParams, StockRecord } from "@/types";
import { StatusActions } from "./status-actions";

const schema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2035),
  rating: z.string().min(1, "Select a transformer rating"),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative").max(100000),
});

type FormValues = z.infer<typeof schema>;

interface QuantityModuleProps {
  title: string;
  description: string;
  queryKey: string;
  service: CrudService<StockRecord>;
  quantityLabel: string;
}

/** Shared page for the Transformer Stock and Transformer Issued modules. */
export function QuantityModule({
  title,
  description,
  queryKey,
  service,
  quantityLabel,
}: QuantityModuleProps) {
  const { user, role } = useAuth();
  const isAdmin = role === "LTL_ADMIN";
  const queryClient = useQueryClient();

  const [params, setParams] = useState<QueryParams>({ page: 1, pageSize: 10 });
  const [editing, setEditing] = useState<StockRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const scoped: QueryParams = useMemo(
    () => (isAdmin ? params : { ...params, provinceCode: user?.provinceCode ?? "" }),
    [params, isAdmin, user],
  );

  const { data, isPending } = useQuery({
    queryKey: [queryKey, scoped],
    queryFn: () => service.list(scoped),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      month: CURRENT_PERIOD.month,
      year: CURRENT_PERIOD.year,
      rating: TRANSFORMER_RATINGS[0] ?? "",
      quantity: 0,
    },
  });

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      if (editing) return service.update(editing.id, values);
      return service.create({
        ...values,
        provinceCode: user?.provinceCode ?? params.provinceCode ?? "EDL-NCP",
      });
    },
    onSuccess: () => {
      toast.success(editing ? "Record updated" : "Draft record added");
      setFormOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => service.remove(id),
    onSuccess: () => {
      toast.success("Record deleted");
      setDeleteId(null);
      invalidate();
    },
  });

  const submitMonth = useMutation({
    mutationFn: () =>
      service.submitPeriod(
        user?.provinceCode ?? "",
        params.month ?? CURRENT_PERIOD.month,
        params.year ?? CURRENT_PERIOD.year,
      ),
    onSuccess: () => {
      toast.success("Submitted to LTL for review");
      invalidate();
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      month: CURRENT_PERIOD.month,
      year: CURRENT_PERIOD.year,
      rating: TRANSFORMER_RATINGS[0] ?? "",
      quantity: 0,
    });
    setFormOpen(true);
  };

  const openEdit = (row: StockRecord) => {
    setEditing(row);
    form.reset({ month: row.month, year: row.year, rating: row.rating, quantity: row.quantity });
    setFormOpen(true);
  };

  const rows = data?.rows ?? [];

  const columns: Column<StockRecord>[] = [
    ...(isAdmin
      ? [
          {
            key: "province",
            header: "Province",
            cell: (r: StockRecord) => <span className="font-medium">{r.provinceCode}</span>,
          },
        ]
      : []),
    {
      key: "period",
      header: "Period",
      cell: (r) => `${MONTHS[r.month - 1] ?? ""} ${r.year}`,
    },
    { key: "rating", header: "Rating", cell: (r) => r.rating, primary: true },
    {
      key: "quantity",
      header: quantityLabel,
      cell: (r) => <span className="numeric font-medium">{r.quantity}</span>,
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "updated",
      header: "Updated",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {new Date(r.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const exportRows = rows.map((r) => [
    r.provinceCode,
    `${MONTHS[r.month - 1] ?? ""} ${r.year}`,
    r.rating,
    r.quantity,
    r.status,
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={description}
        breadcrumb={["Data Modules", title]}
        actions={
          <>
            <ExportMenu
              filename={queryKey}
              title={title}
              columns={["Province", "Period", "Rating", quantityLabel, "Status"]}
              rows={exportRows}
              disabled={rows.length === 0}
            />
            {!isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => submitMonth.mutate()}
                disabled={submitMonth.isPending}
              >
                <Send className="mr-1.5 h-4 w-4" /> Submit month
              </Button>
            )}
            {!isAdmin && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 h-4 w-4" /> Add record
              </Button>
            )}
          </>
        }
      />

      <FilterBar
        value={params}
        onChange={setParams}
        show={{ province: isAdmin, period: true, status: true, rating: true }}
        searchPlaceholder="Search by rating or province…"
      />

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        loading={isPending}
        total={data?.total ?? 0}
        page={params.page ?? 1}
        pageSize={params.pageSize ?? 10}
        onPageChange={(page) => setParams((p) => ({ ...p, page }))}
        rowActions={(row) => (
          <div className="flex items-center justify-end gap-1">
            {isAdmin ? (
              <StatusActions
                status={row.status}
                onChange={(status) => service.setStatus([row.id], status).then(invalidate)}
              />
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit record"
                  disabled={row.status === "LOCKED" || row.status === "APPROVED"}
                  onClick={() => openEdit(row)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete record"
                  disabled={row.status !== "DRAFT"}
                  onClick={() => setDeleteId(row.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        )}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit record" : "Add record"}</DialogTitle>
            <DialogDescription>
              Entries are saved as drafts until the month is submitted to LTL.
            </DialogDescription>
          </DialogHeader>
          <form
            id="quantity-form"
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => save.mutate(v))}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="month">Month</Label>
                <Select
                  value={String(form.watch("month"))}
                  onValueChange={(v) => form.setValue("month", Number(v))}
                >
                  <SelectTrigger id="month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" {...form.register("year")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rating">Transformer rating</Label>
              <Select
                value={form.watch("rating")}
                onValueChange={(v) => form.setValue("rating", v)}
              >
                <SelectTrigger id="rating">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSFORMER_RATINGS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.rating && (
                <p className="text-xs text-destructive">{form.formState.errors.rating.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantity">{quantityLabel}</Label>
              <Input id="quantity" type="number" min={0} {...form.register("quantity")} />
              {form.formState.errors.quantity && (
                <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>
              )}
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="quantity-form" disabled={save.isPending}>
              Save draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete draft record?"
        description="This draft entry will be permanently removed. Finalised records cannot be deleted."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </div>
  );
}
