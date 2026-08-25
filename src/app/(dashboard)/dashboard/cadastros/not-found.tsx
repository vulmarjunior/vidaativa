import Link from "next/link";
import { SearchX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function CatalogNotFound() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <Alert role="status">
        <SearchX aria-hidden="true" />
        <AlertTitle>Cadastro não encontrado</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>O registro pode ter sido removido da consulta ou o endereço está incorreto.</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/cadastros">Voltar aos cadastros</Link>
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
