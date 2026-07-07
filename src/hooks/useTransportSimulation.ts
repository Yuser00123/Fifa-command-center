/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { TransportStatus } from '../types';

export function useTransportSimulation(
  setTransports: React.Dispatch<React.SetStateAction<TransportStatus[]>>
) {
  const simulateDelay = useCallback((parkingId: string, delayMinutes: number) => {
    setTransports((prev) =>
      prev.map((t) => {
        if (t.parkingId === parkingId) {
          const status = delayMinutes > 10 ? 'full' : delayMinutes > 4 ? 'filling_fast' : 'available';
          const availableSpaces = delayMinutes > 10 ? 0 : Math.max(50, t.availableSpaces - 100);
          return {
            ...t,
            delayMinutes,
            status,
            availableSpaces,
          };
        }
        return t;
      })
    );
  }, [setTransports]);

  return { simulateDelay };
}
