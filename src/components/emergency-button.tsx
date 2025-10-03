'use client';

import * as React from 'react';
import { Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { sendEmergencyNotificationAction } from '@/app/(admin)/admin/requests/actions';
import type { SessionUser } from '@/lib/types';
import { cn } from '@/lib/utils';

interface EmergencyButtonProps {
    session: SessionUser;
    className?: string;
}

export function EmergencyButton({ session, className }: EmergencyButtonProps) {
    const { toast } = useToast();
    const [isSendingEmergency, setIsSendingEmergency] = React.useState(false);

    const handleEmergency = async () => {
        if (isSendingEmergency) return;
        setIsSendingEmergency(true);
        try {
            const result = await sendEmergencyNotificationAction({ senderId: session.id, senderName: session.name });
            if (result.success) {
                toast({ title: "Alerta Enviada", description: "El administrador principal ha sido notificado." });
            } else {
                throw new Error(result.error);
            }
        } catch (e) {
            toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
        } finally {
            // Add a cooldown to prevent spamming
            setTimeout(() => setIsSendingEmergency(false), 3000);
        }
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="destructive"
                    size="icon"
                    aria-label="Alerta de emergencia"
                    onClick={handleEmergency}
                    disabled={isSendingEmergency}
                    className={cn(className)}
                >
                    <Siren className="h-5 w-5" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Enviar alerta de emergencia</p>
            </TooltipContent>
        </Tooltip>
    );
}
