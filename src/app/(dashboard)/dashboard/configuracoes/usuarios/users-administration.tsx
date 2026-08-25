"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CircleHelp, KeyRound, Search, UserRoundCog, UsersRound } from "lucide-react";
import { cancelPendingInvitation, updateUserAccess } from "./actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { APP_ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS, getManagedUserStatus, type AppRole, type ManagedUser, type ManagedUserStatus } from "@/lib/users/types";

type Professional = { id: string; name: string; active: boolean };
const PAGE_SIZE = 10;
const STATUS_LABELS: Record<ManagedUserStatus, string> = { pending: "Convite pendente", active: "Ativo", inactive: "Inativo" };

export function UsersDirectory({ users, professionals, currentUserId }: { users: ManagedUser[]; professionals: Professional[]; currentUserId: string | null }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [status, setStatus] = useState<ManagedUserStatus | "all">("all");
  const [role, setRole] = useState<AppRole | "all">("all");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const term = deferredQuery.trim().toLocaleLowerCase("pt-BR");
    return users.filter((user) => {
      const matchesText = !term || user.fullName.toLocaleLowerCase("pt-BR").includes(term) || user.email.toLocaleLowerCase("pt-BR").includes(term);
      return matchesText && (status === "all" || getManagedUserStatus(user) === status) && (role === "all" || user.roles.includes(role));
    });
  }, [deferredQuery, role, status, users]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const updateFilters = (callback: () => void) => { callback(); setPage(1); };

  return <section className="space-y-4" aria-labelledby="users-heading">
    <div className="flex flex-wrap items-center gap-2"><UsersRound className="size-5 text-primary" /><h2 id="users-heading" className="text-xl font-semibold">Contas cadastradas</h2><Badge variant="secondary">{users.length}</Badge></div>
    <Card><CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(14rem,1fr)_13rem_13rem]">
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden="true" /><Label htmlFor="user-search" className="sr-only">Buscar por nome ou e-mail</Label><Input id="user-search" value={query} onChange={(event) => updateFilters(() => setQuery(event.target.value))} placeholder="Buscar por nome ou e-mail" className="pl-9" /></div>
      <FilterSelect id="user-role-filter" label="Filtrar por papel" value={role} onChange={(value) => updateFilters(() => setRole(value as AppRole | "all"))}><option value="all">Todos os papéis</option>{APP_ROLES.map((item) => <option key={item} value={item}>{ROLE_LABELS[item]}</option>)}</FilterSelect>
      <FilterSelect id="user-status-filter" label="Filtrar por situação" value={status} onChange={(value) => updateFilters(() => setStatus(value as ManagedUserStatus | "all"))}><option value="all">Todas as situações</option><option value="pending">Convite pendente</option><option value="active">Ativo</option><option value="inactive">Inativo</option></FilterSelect>
    </CardContent></Card>

    {visible.length === 0 ? <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhum usuário corresponde aos filtros.</CardContent></Card> : <div className="overflow-hidden rounded-xl border bg-card">
      <div className="hidden grid-cols-[minmax(13rem,1.3fr)_minmax(12rem,1fr)_9rem_8rem] gap-4 border-b bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground md:grid"><span>Usuário</span><span>Papéis</span><span>Situação</span><span className="text-right">Ação</span></div>
      <div className="divide-y">{visible.map((user) => <UserRow key={user.id} user={user} professionals={professionals} self={user.id === currentUserId} />)}</div>
    </div>}

    {pageCount > 1 && <div className="flex items-center justify-between gap-4 text-sm"><p className="text-muted-foreground">Página {currentPage} de {pageCount} · {filtered.length} conta(s)</p><div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Anterior</Button><Button type="button" variant="outline" size="sm" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Próxima</Button></div></div>}
  </section>;
}

function UserRow({ user, professionals, self }: { user: ManagedUser; professionals: Professional[]; self: boolean }) {
  const status = getManagedUserStatus(user);
  return <div className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(13rem,1.3fr)_minmax(12rem,1fr)_9rem_8rem] md:items-center md:gap-4">
    <div className="min-w-0"><p className="truncate font-medium">{user.fullName || "Nome não informado"}{self && <span className="ml-2 text-xs font-normal text-muted-foreground">Você</span>}</p><p className="truncate text-sm text-muted-foreground">{user.email}</p>{user.lastSignInAt && <p className="mt-1 text-xs text-muted-foreground">Último acesso {date(user.lastSignInAt)}</p>}</div>
    <div className="flex flex-wrap gap-1.5" aria-label={`Papéis: ${user.roles.map((item) => ROLE_LABELS[item]).join(", ")}`}>{user.roles.map((item) => <Badge key={item} variant="outline">{ROLE_LABELS[item]}</Badge>)}</div>
    <StatusBadge status={status} />
    <div className="flex md:justify-end"><UserEditor user={user} professionals={professionals} self={self} /></div>
  </div>;
}

function UserEditor({ user, professionals, self }: { user: ManagedUser; professionals: Professional[]; self: boolean }) {
  const pending = getManagedUserStatus(user) === "pending";
  return <Sheet><SheetTrigger asChild><Button type="button" variant="outline" size="sm"><UserRoundCog />Editar</Button></SheetTrigger><SheetContent className="w-full overflow-y-auto sm:max-w-xl"><SheetHeader><SheetTitle>Editar usuário</SheetTitle><SheetDescription>{user.email} · {STATUS_LABELS[getManagedUserStatus(user)]}</SheetDescription></SheetHeader><div className="px-4 pb-6"><form action={updateUserAccess} className="space-y-5"><input type="hidden" name="userId" value={user.id} /><div className="space-y-2"><Label htmlFor={`full-name-${user.id}`}>Nome completo</Label><Input id={`full-name-${user.id}`} name="fullName" defaultValue={user.fullName} required /></div><ProfessionalSelect id={`professional-${user.id}`} professionals={professionals} selected={user.professionalId} /><RoleSelector selected={user.roles} lockAdmin={self} namePrefix={user.id} /><div className="rounded-lg border p-3"><label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="active" defaultChecked={user.active} disabled={self || pending} className="size-4 accent-primary" />Conta ativa</label>{self && <input type="hidden" name="active" value="on" />} {pending && user.active && <input type="hidden" name="active" value="on" />}<p className="mt-1 text-xs text-muted-foreground">{pending ? "O acesso só será liberado após a confirmação do convite." : self ? "Seu próprio acesso administrativo não pode ser inativado." : "Desmarque para impedir novos acessos preservando o histórico."}</p></div><div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5"><Button type="submit"><KeyRound />Salvar alterações</Button>{pending && !self && <CancelInvitation user={user} />}</div></form></div></SheetContent></Sheet>;
}

function CancelInvitation({ user }: { user: ManagedUser }) {
  return <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive">Cancelar convite</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Cancelar convite pendente?</AlertDialogTitle><AlertDialogDescription>Esta ação removerá a conta não confirmada de {user.email} e seus papéis provisórios. Contas confirmadas não podem ser excluídas por este fluxo.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Manter convite</AlertDialogCancel><form action={cancelPendingInvitation}><input type="hidden" name="userId" value={user.id} /><AlertDialogAction type="submit" variant="destructive">Confirmar cancelamento</AlertDialogAction></form></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

export function RoleSelector({ selected, namePrefix, lockAdmin = false }: { selected: AppRole[]; namePrefix: string; lockAdmin?: boolean }) {
  return <TooltipProvider><fieldset className="space-y-3"><legend className="text-sm font-medium">Papéis de acesso</legend><p className="text-xs text-muted-foreground">Selecione um ou mais papéis. As permissões são combinadas e as mudanças são auditadas.</p><div className="grid gap-2 sm:grid-cols-2">{APP_ROLES.map((role) => { const id = `${namePrefix}-role-${role}`; return <div key={role} className="flex items-center gap-2 rounded-lg border px-3 py-2"><input id={id} type="checkbox" name="roles" value={role} defaultChecked={selected.includes(role)} disabled={lockAdmin && role === "admin"} className="size-4 shrink-0 accent-primary" />{lockAdmin && role === "admin" && <input type="hidden" name="roles" value="admin" />}<Label htmlFor={id} className="min-w-0 flex-1 leading-tight">{ROLE_LABELS[role]}</Label><Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label={`Sobre o papel ${ROLE_LABELS[role]}`}><CircleHelp /></Button></TooltipTrigger><TooltipContent className="max-w-xs">{ROLE_DESCRIPTIONS[role]}</TooltipContent></Tooltip></div>; })}</div></fieldset></TooltipProvider>;
}

export function ProfessionalSelect({ id, professionals, selected }: { id: string; professionals: Professional[]; selected?: string | null }) {
  return <div className="space-y-2"><Label htmlFor={id}>Vínculo profissional</Label><select id={id} name="professionalId" defaultValue={selected ?? ""} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="">Sem vínculo profissional</option>{professionals.filter((item) => item.active || item.id === selected).map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? "" : " (inativo)"}</option>)}</select></div>;
}

function FilterSelect({ id, label, value, onChange, children }: { id: string; label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <div><Label htmlFor={id} className="sr-only">{label}</Label><select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm">{children}</select></div>;
}

function StatusBadge({ status }: { status: ManagedUserStatus }) {
  return <Badge variant={status === "active" ? "secondary" : "outline"} className="w-fit">{STATUS_LABELS[status]}</Badge>;
}

function date(value: string) { return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR }); }
