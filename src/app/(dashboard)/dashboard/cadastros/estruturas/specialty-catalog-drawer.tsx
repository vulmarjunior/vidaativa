"use client";

import { useDeferredValue, useState } from "react";
import { BookOpenCheck, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { SpecialtyCatalogItem } from "@/lib/catalog/queries";

export function SpecialtyCatalogDrawer({ items }: { items: SpecialtyCatalogItem[] }) {
  const [search, setSearch] = useState("");
  const [profession, setProfession] = useState("all");
  const [classification, setClassification] = useState("all");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("pt-BR"));
  const professions = Array.from(new Set(items.map((item) => item.professions?.name).filter((name): name is string => Boolean(name))));
  const visibleItems = items.filter((item) => {
    const matchesSearch = !deferredSearch || item.name.toLocaleLowerCase("pt-BR").includes(deferredSearch);
    const matchesProfession = profession === "all" || item.professions?.name === profession;
    const matchesClassification = classification === "all" || item.classification === classification;
    return matchesSearch && matchesProfession && matchesClassification;
  });
  const specialties = items.filter((item) => item.classification === "specialty" && item.active).length;
  const areas = items.filter((item) => item.classification === "area_of_practice" && item.active).length;

  return <div className="rounded-xl border bg-card p-5 xl:col-span-2">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2"><BookOpenCheck className="size-5 text-primary" /><h2 className="font-semibold">Especialidades oficiais</h2></div>
        <p className="mt-1 text-sm text-muted-foreground">{specialties} especialidades e {areas} áreas de atuação ativas, organizadas por profissão.</p>
        <div className="mt-3 flex flex-wrap gap-2">{professions.map((name) => <Badge key={name} variant="outline">{name}</Badge>)}</div>
      </div>
      <Sheet>
        <SheetTrigger asChild><Button><Search />Consultar catálogo</Button></SheetTrigger>
        <SheetContent className="w-full gap-0 sm:max-w-2xl">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle>Catálogo oficial de especialidades</SheetTitle>
            <SheetDescription>Consulte por nome, profissão ou tipo. Entradas oficiais são somente leitura.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-3 border-b p-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="specialty-search">Buscar</Label><Input id="specialty-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ex.: cardiologia, gerontologia..." /></div>
            <div className="space-y-2"><Label htmlFor="specialty-profession">Profissão</Label><select id="specialty-profession" value={profession} onChange={(event) => setProfession(event.target.value)} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="all">Todas</option>{professions.map((name) => <option key={name} value={name}>{name}</option>)}</select></div>
            <div className="space-y-2"><Label htmlFor="specialty-type">Tipo</Label><select id="specialty-type" value={classification} onChange={(event) => setClassification(event.target.value)} className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"><option value="all">Todos</option><option value="specialty">Especialidade</option><option value="area_of_practice">Área de atuação</option></select></div>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <p className="mb-3 text-xs text-muted-foreground" aria-live="polite">{visibleItems.length} resultado(s)</p>
            <div className="space-y-2">{visibleItems.length === 0 ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Nenhuma entrada corresponde aos filtros.</p> : visibleItems.map((item) => <article key={item.id} className="rounded-lg border p-4 [content-visibility:auto]">
              <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-medium">{item.name}</h3><Badge variant={item.active ? "secondary" : "outline"}>{item.active ? "Oficial" : "Histórico"}</Badge></div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{item.professions?.name}</span><span>•</span><span>{item.classification === "specialty" ? "Especialidade" : "Área de atuação"}</span>{item.official_code ? <><span>•</span><span>Código {item.official_code}</span></> : null}</div>
              <p className="mt-2 text-xs text-muted-foreground">{item.specialty_catalog_releases?.regulatory_authorities?.acronym} · {item.specialty_catalog_releases?.version_label}</p>
            </article>)}</div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </div>;
}
