"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function CatalogError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Falha inesperada nos cadastros estruturantes", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl py-8">
      <Alert variant="destructive" role="alert">
        <AlertTriangle aria-hidden="true" />
        <AlertTitle>Não foi possível carregar esta área</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>Ocorreu uma falha inesperada. Tente novamente sem perder sua sessão.</p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="destructive" onClick={() => retry()}>
              Tentar novamente
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/dashboard">Voltar ao início</Link>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
