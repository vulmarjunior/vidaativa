import Link from "next/link";
import { Activity, ArrowRight, Bone, CalendarDays, HeartPulse, ShieldCheck } from "lucide-react";
import { ClinicBrand } from "@/components/brand/clinic-brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getClinicSettings } from "@/lib/clinic/queries";

const services = [
  { icon: HeartPulse, title: "Atendimento médico", description: "Avaliação integral e acompanhamento contínuo." },
  { icon: Bone, title: "Fisioterapia", description: "Planos terapêuticos personalizados para sua recuperação." },
  { icon: Activity, title: "Pilates", description: "Movimento, equilíbrio e consciência corporal." },
];

export default async function HomePage() {
  const clinic = await getClinicSettings();
  return <main className="min-h-screen">
    <header className="border-b bg-background/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"><ClinicBrand clinic={clinic} /><nav className="flex items-center gap-3" aria-label="Navegação principal"><Button variant="ghost" asChild className="hidden sm:inline-flex"><a href="#servicos">Serviços</a></Button><Button asChild><Link href="/login">Acessar sistema</Link></Button></nav></div></header>
    <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-28">
      <div className="flex flex-col justify-center"><Badge variant="secondary" className="mb-5 w-fit">Medicina • Fisioterapia • Movimento</Badge><h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">Cuidado integrado para uma vida com mais saúde e movimento.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Atendimento acolhedor, avaliação individual e acompanhamento profissional em todas as etapas do cuidado.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button size="lg" asChild><a href="#contato">Solicitar atendimento <ArrowRight className="size-4" /></a></Button><Button size="lg" variant="outline" asChild><a href="#servicos">Conhecer serviços</a></Button></div><div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-secondary-foreground" />Dados tratados com segurança</span><span className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />Atendimento organizado</span></div></div>
      <div className="relative overflow-hidden rounded-3xl border bg-card p-4 shadow-xl shadow-primary/10"><div className="grid min-h-[430px] place-items-center rounded-2xl bg-[linear-gradient(145deg,var(--secondary),var(--background)_48%,color-mix(in_oklab,var(--primary)_18%,white))] p-8 text-center"><div><ClinicBrand clinic={clinic} /><p className="mt-8 text-2xl font-medium">Seu cuidado, conectado.</p><p className="mt-2 max-w-sm text-muted-foreground">Uma jornada coordenada entre consulta, terapia e evolução.</p></div></div></div>
    </section>
    <section id="servicos" className="border-y bg-card/70"><div className="mx-auto max-w-7xl px-6 py-16 lg:px-8"><p className="text-sm font-medium text-primary">Cuidado multidisciplinar</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Serviços pensados para cada fase.</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{services.map(({ icon: Icon, title, description }) => <Card key={title} className="border-border/70 shadow-none"><CardContent className="pt-6"><span className="mb-5 grid size-11 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Icon className="size-5" /></span><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></CardContent></Card>)}</div></div></section>
    <footer id="contato" className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-8"><ClinicBrand clinic={clinic} /><p className="text-sm text-muted-foreground">{clinic.email ?? "Dados de contato serão publicados após o cadastro da clínica."}</p></footer>
  </main>;
}
