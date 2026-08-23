import Link from "next/link";
import { Boxes, BriefcaseMedical, DoorOpen, PackageOpen, Settings2, Tags } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCatalogData, type CatalogItem } from "@/lib/catalog/queries";
import { createCategory, createProfessional, createResource, createRoom, createService, toggleCatalogItem } from "./actions";

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [data, params] = await Promise.all([getCatalogData(), searchParams]);
  const canManage = data.role === "admin";
  return <div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Cadastros estruturantes</p><h1 className="text-3xl font-semibold tracking-tight">Profissionais, serviços e recursos</h1><p className="mt-1 text-muted-foreground">Catálogo operacional reutilizado pela agenda e pelos futuros planos assistenciais.</p></div><Button asChild variant="outline"><Link href="/dashboard/cadastros/estruturas"><Settings2 />Habilitações e atividades</Link></Button></div>
    {params.status === "saved" && <Alert><AlertTitle>Cadastro atualizado</AlertTitle><AlertDescription>A alteração foi salva e registrada na auditoria.</AlertDescription></Alert>}
    {params.status === "invalid" && <Alert variant="destructive"><AlertTitle>Dados inválidos</AlertTitle><AlertDescription>Revise os campos e tente novamente.</AlertDescription></Alert>}
    {params.status === "error" && <Alert variant="destructive"><AlertTitle>Não foi possível salvar</AlertTitle><AlertDescription>O registro pode estar duplicado ou contrariar uma regra de integridade.</AlertDescription></Alert>}
    {params.status === "forbidden" && <Alert variant="destructive"><AlertTitle>Acesso negado</AlertTitle><AlertDescription>Somente o administrador técnico pode alterar estes cadastros.</AlertDescription></Alert>}
    {data.error && <Alert variant="destructive"><AlertTitle>Cadastros indisponíveis</AlertTitle><AlertDescription>{data.error}</AlertDescription></Alert>}
    {!canManage && !data.error && <Alert><AlertTitle>Consulta somente</AlertTitle><AlertDescription>Seu perfil pode consultar o catálogo, mas não alterá-lo.</AlertDescription></Alert>}

    <div className="grid gap-5 xl:grid-cols-2">
      <CatalogCard title="Profissionais" description="Pessoas habilitadas para a operação clínica." icon={BriefcaseMedical} items={data.professionals} table="professionals" canManage={canManage} columns={(item) => <span className="flex flex-wrap items-center gap-2"><span>{item.email || item.phone || "Sem contato"}</span><Button asChild size="sm" variant="outline"><Link href={`/dashboard/cadastros/profissionais/${item.id}`}>Ficha profissional</Link></Button></span>}>
        <form action={createProfessional} className="grid gap-3 sm:grid-cols-2"><Field name="fullName" label="Nome completo" required /><Field name="displayName" label="Nome de exibição" /><Field name="email" label="E-mail" type="email" /><Field name="phone" label="Telefone" /><Submit disabled={!canManage}>Adicionar profissional</Submit></form>
      </CatalogCard>
      <CatalogCard title="Categorias de serviço" description="Dados configuráveis, sem modalidades rígidas." icon={Tags} items={data.categories} table="service_categories" canManage={canManage}>
        <form action={createCategory} className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]"><Field name="name" label="Nome" required /><Field name="description" label="Descrição" /><Submit disabled={!canManage}>Adicionar</Submit></form>
      </CatalogCard>
      <CatalogCard title="Serviços" description="Duração e capacidade padrão do atendimento." icon={Boxes} items={data.services} table="services" canManage={canManage} columns={(item) => <span className="flex flex-wrap items-center gap-2"><span>{item.service_categories?.name ?? "Sem categoria"} · {item.default_duration_minutes} min · capacidade {item.default_capacity}</span><Button asChild size="sm" variant="outline"><Link href={`/dashboard/cadastros/servicos/${item.id}`}>Configurar</Link></Button></span>}>
        <form action={createService} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Field name="name" label="Nome" required /><div className="space-y-2"><Label htmlFor="categoryId">Categoria</Label><select id="categoryId" name="categoryId" required className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="">Selecione</option>{data.categories.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><Field name="duration" label="Duração (min)" type="number" defaultValue="50" required /><Field name="capacity" label="Capacidade" type="number" defaultValue="1" required /><Submit disabled={!canManage || data.categories.length === 0}>Adicionar serviço</Submit></form>
      </CatalogCard>
      <CatalogCard title="Salas" description="Espaços disponíveis para agendamento." icon={DoorOpen} items={data.rooms} table="rooms" canManage={canManage} columns={(item) => `Capacidade ${item.capacity}${item.exclusive_use ? " · uso exclusivo" : ""}`}>
        <AssetForm action={createRoom} amountLabel="Capacidade" disabled={!canManage} />
      </CatalogCard>
      <CatalogCard title="Recursos e equipamentos" description="Itens compartilháveis ou exclusivos." icon={PackageOpen} items={data.resources} table="resources" canManage={canManage} columns={(item) => `Quantidade ${item.quantity}${item.exclusive_use ? " · uso exclusivo" : ""}`}>
        <AssetForm action={createResource} amountLabel="Quantidade" disabled={!canManage} />
      </CatalogCard>
    </div>
  </div>;
}

function CatalogCard<T extends CatalogItem>({ title, description, icon: Icon, items, table, canManage, columns, children }: { title: string; description: string; icon: typeof Boxes; items: T[]; table: string; canManage: boolean; columns?: (item: T) => React.ReactNode; children: React.ReactNode }) {
  return <Card className="overflow-hidden"><CardHeader><div className="flex items-center gap-2"><Icon className="size-5 text-primary" /><CardTitle>{title}</CardTitle></div><CardDescription>{description}</CardDescription></CardHeader><CardContent className="space-y-5">{children}<div className="rounded-lg border"><Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Detalhes</TableHead><TableHead className="w-24">Situação</TableHead></TableRow></TableHeader><TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Nenhum cadastro encontrado.</TableCell></TableRow> : items.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.name}</TableCell><TableCell className="text-muted-foreground">{columns?.(item) ?? "—"}</TableCell><TableCell><form action={toggleCatalogItem}><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={item.id} /><input type="hidden" name="active" value={String(item.active)} /><Button type="submit" size="sm" variant="ghost" disabled={!canManage}><Badge variant={item.active ? "secondary" : "outline"}>{item.active ? "Ativo" : "Inativo"}</Badge></Button></form></TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>;
}

function Field({ name, label, type = "text", defaultValue, required }: { name: string; label: string; type?: string; defaultValue?: string; required?: boolean }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} /></div>; }
function Submit({ disabled, children }: { disabled: boolean; children: React.ReactNode }) { return <div className="flex items-end"><Button type="submit" disabled={disabled}>{children}</Button></div>; }
function AssetForm({ action, amountLabel, disabled }: { action: (formData: FormData) => Promise<void>; amountLabel: string; disabled: boolean }) { return <form action={action} className="grid gap-3 sm:grid-cols-[1fr_8rem_auto_auto]"><Field name="name" label="Nome" required /><Field name="amount" label={amountLabel} type="number" defaultValue="1" required /><div className="flex items-end gap-2 pb-2"><Checkbox id={`exclusive-${amountLabel}`} name="exclusive" /><Label htmlFor={`exclusive-${amountLabel}`}>Exclusivo</Label></div><Submit disabled={disabled}>Adicionar</Submit></form>; }
