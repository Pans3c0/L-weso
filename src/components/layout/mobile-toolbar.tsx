'use client';

import * as React from 'react';
import { useSession } from '@/hooks/use-session';
import { EmergencyButton } from '../emergency-button';

export function MobileToolbar() {
    const { session } = useSession();

    if (!session) {
        return null;
    }

    return (
        <div className="sm:hidden fixed bottom-4 right-4 z-50">
            <EmergencyButton session={session} />
        </div>
    );
}
