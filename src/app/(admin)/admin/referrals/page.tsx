'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, PlusCircle, Copy, Loader2 } from 'lucide-react';
import { generateReferralCodeAction, getReferralCodesForSeller } from './actions';
import { useSession } from '@/hooks/use-session';

export default function ReferralsPage() {
  const { toast } = useToast();
  const { session } = useSession();
  const [codes, setCodes] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const fetchCodes = React.useCallback(async () => {
    if (!session?.sellerId) return;
    setIsLoading(true);
    try {
      const currentCodes = await getReferralCodesForSeller(session.sellerId);
      setCodes(currentCodes);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los códigos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, session?.sellerId]);

  React.useEffect(() => {
    if (session?.sellerId) {
      fetchCodes();
    }
  }, [fetchCodes, session?.sellerId]);

  const handleGenerateCode = async () => {
    if (!session?.sellerId) {
        toast({ title: 'Error', description: 'No se ha podido identificar al vendedor.', variant: 'destructive' });
        return;
    }
    setIsGenerating(true);
    try {
      const result = await generateReferralCodeAction({ sellerId: session.sellerId });
      if (result.success && result.newCode) {
        toast({
          title: 'Código Generado',
          description: `Nuevo código: ${result.newCode}`,
        });
        await fetchCodes(); // Refetch codes to show the new one
      } else {
        throw new Error(result.error || 'No se pudo generar el código.');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ocurrió un error.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copiado',
      description: `El código "${code}" ha sido copiado al portapapeles.`,
    });
  };
  
  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <div>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Códigos de Referencia</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" onClick={handleGenerateCode} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {isGenerating ? 'Generando...' : 'Generar Nuevo Código'}
              </span>
            </Button>
        </div>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Códigos de Un Solo Uso Activos</CardTitle>
          <CardDescription>
            Estos códigos pueden ser usados una sola vez para registrar un nuevo cliente en tu tienda. Una vez utilizados, desaparecerán de esta lista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {codes.length > 0 ? (
            <div className="space-y-3">
              {codes.map((code) => (
                <div key={code} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <KeyRound className="h-5 w-5 mr-3 text-primary" />
                    <span className="font-mono text-lg tracking-wider">{code}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(code)}>
                    <Copy className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>No hay códigos de referencia activos. Genera uno para registrar nuevos clientes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
