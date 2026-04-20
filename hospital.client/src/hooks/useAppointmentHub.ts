import { useCallback, useEffect, useRef, useState } from 'react';

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';

import { usePatientAuthStore } from '../stores/usePatientAuthStore';
import type {
  ConnectionState,
  SlotLockInfo,
  SlotLockRejection,
} from '../types/SlotLockTypes';

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseAppointmentHubReturn {
  /** Current SignalR connection state */
  connectionState: ConnectionState;
  /** Slots locked by OTHER patients — key is "HH:mm" */
  lockedSlots: Map<string, SlotLockInfo>;
  /** Permanently confirmed (booked) slots */
  confirmedSlots: Set<string>;
  /** The slot currently locked by the current patient (or null) */
  myLockedSlot: string | null;
  /** Request a lock on a time slot */
  lockSlot: (time: string) => Promise<void>;
  /** Release the currently held lock */
  releaseSlot: (time: string) => Promise<void>;
  /** Last error / rejection message */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Helper: map HubConnectionState → our ConnectionState union
// ---------------------------------------------------------------------------

function toConnectionState(state: HubConnectionState): ConnectionState {
  switch (state) {
    case HubConnectionState.Connected:
      return 'connected';
    case HubConnectionState.Connecting:
      return 'connecting';
    case HubConnectionState.Reconnecting:
      return 'reconnecting';
    default:
      return 'disconnected';
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages a SignalR connection to the appointment-booking hub.
 *
 * Handles group subscription (doctor + date), slot lock/release commands,
 * and real-time event listeners for lock state synchronisation.
 *
 * @param doctorId - The doctor whose calendar is being viewed (null = inactive)
 * @param date     - The selected date in "yyyy-MM-dd" format (null = inactive)
 */
export function useAppointmentHub(
  doctorId: number | null,
  date: string | null,
): UseAppointmentHubReturn {
  // ---- state ---------------------------------------------------------------
  const [connectionState, setConnectionState] =
    useState<ConnectionState>('disconnected');
  const [lockedSlots, setLockedSlots] = useState<Map<string, SlotLockInfo>>(
    () => new Map(),
  );
  const [confirmedSlots, setConfirmedSlots] = useState<Set<string>>(
    () => new Set(),
  );
  const [myLockedSlot, setMyLockedSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---- refs ----------------------------------------------------------------
  const connectionRef = useRef<HubConnection | null>(null);
  const groupRef = useRef<{ doctorId: number; date: string } | null>(null);
  const myLockedSlotRef = useRef<string | null>(null);

  // Keep the ref in sync so cleanup callbacks always see the latest value.
  useEffect(() => {
    myLockedSlotRef.current = myLockedSlot;
  }, [myLockedSlot]);

  // ---- build connection (once) --------------------------------------------
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('/hubs/appointment-booking', {
        accessTokenFactory: () =>
          usePatientAuthStore.getState().token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    // --- connection lifecycle callbacks ---
    connection.onreconnecting(() => {
      setConnectionState('reconnecting');
    });

    connection.onreconnected(async () => {
      setConnectionState('connected');
      // Re-join the current group and sync state after reconnection
      if (groupRef.current) {
        try {
          await connection.invoke(
            'JoinSlotGroup',
            groupRef.current.doctorId,
            groupRef.current.date,
          );
        } catch {
          // The ActiveLocks event will re-populate state
        }
      }
    });

    connection.onclose(() => {
      setConnectionState('disconnected');
    });

    // --- event listeners ---
    connection.on('ActiveLocks', (locks: SlotLockInfo[]) => {
      const map = new Map<string, SlotLockInfo>();
      for (const lock of locks) {
        map.set(lock.time, lock);
      }
      setLockedSlots(map);
    });

    connection.on('SlotLocked', (info: SlotLockInfo) => {
      setLockedSlots((prev) => {
        const next = new Map(prev);
        next.set(info.time, info);
        return next;
      });
    });

    connection.on('SlotReleased', (info: SlotLockInfo) => {
      setLockedSlots((prev) => {
        const next = new Map(prev);
        next.delete(info.time);
        return next;
      });
    });

    connection.on('SlotLockRejected', (rejection: SlotLockRejection) => {
      setError(rejection.reason);
    });

    connection.on('SlotConfirmed', (info: SlotLockInfo) => {
      setConfirmedSlots((prev) => {
        const next = new Set(prev);
        next.add(info.time);
        return next;
      });
      setLockedSlots((prev) => {
        const next = new Map(prev);
        next.delete(info.time);
        return next;
      });
    });

    connectionRef.current = connection;

    // Cleanup: stop the connection when the hook is destroyed
    return () => {
      const conn = connectionRef.current;
      if (!conn) return;

      const cleanup = async () => {
        try {
          // Release the patient's own lock if any
          if (
            myLockedSlotRef.current &&
            groupRef.current &&
            conn.state === HubConnectionState.Connected
          ) {
            await conn.invoke(
              'ReleaseSlot',
              groupRef.current.doctorId,
              groupRef.current.date,
              myLockedSlotRef.current,
            );
          }

          // Leave the current group
          if (
            groupRef.current &&
            conn.state === HubConnectionState.Connected
          ) {
            await conn.invoke(
              'LeaveSlotGroup',
              groupRef.current.doctorId,
              groupRef.current.date,
            );
          }
        } catch {
          // Best-effort cleanup — server will handle disconnection anyway
        } finally {
          await conn.stop();
        }
      };

      cleanup();
      connectionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- start / stop connection based on params ----------------------------
  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection) return;

    if (doctorId != null && date != null) {
      if (connection.state === HubConnectionState.Disconnected) {
        setConnectionState('connecting');
        connection
          .start()
          .then(() => {
            setConnectionState(toConnectionState(connection.state));
          })
          .catch(() => {
            setConnectionState('disconnected');
          });
      }
    } else {
      // Both params are null → disconnect
      if (connection.state !== HubConnectionState.Disconnected) {
        const leaveAndStop = async () => {
          try {
            if (
              groupRef.current &&
              connection.state === HubConnectionState.Connected
            ) {
              if (myLockedSlotRef.current) {
                await connection.invoke(
                  'ReleaseSlot',
                  groupRef.current.doctorId,
                  groupRef.current.date,
                  myLockedSlotRef.current,
                );
              }
              await connection.invoke(
                'LeaveSlotGroup',
                groupRef.current.doctorId,
                groupRef.current.date,
              );
            }
          } catch {
            // best-effort
          } finally {
            groupRef.current = null;
            setMyLockedSlot(null);
            setLockedSlots(new Map());
            setConfirmedSlots(new Set());
            await connection.stop();
            setConnectionState('disconnected');
          }
        };
        leaveAndStop();
      }
    }
  }, [doctorId, date]);

  // ---- group management (join / leave) ------------------------------------
  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== HubConnectionState.Connected) return;
    if (doctorId == null || date == null) return;

    const prev = groupRef.current;
    const isSameGroup =
      prev != null && prev.doctorId === doctorId && prev.date === date;

    if (isSameGroup) return;

    const switchGroup = async () => {
      try {
        // Leave previous group first
        if (prev) {
          if (myLockedSlotRef.current) {
            await connection.invoke(
              'ReleaseSlot',
              prev.doctorId,
              prev.date,
              myLockedSlotRef.current,
            );
            setMyLockedSlot(null);
          }
          await connection.invoke(
            'LeaveSlotGroup',
            prev.doctorId,
            prev.date,
          );
        }

        // Reset local state for the new group
        setLockedSlots(new Map());
        setConfirmedSlots(new Set());
        setError(null);

        // Join new group
        await connection.invoke('JoinSlotGroup', doctorId, date);
        groupRef.current = { doctorId, date };
      } catch {
        setError('Error al cambiar de grupo. Intente de nuevo.');
      }
    };

    switchGroup();
  }, [doctorId, date, connectionState]);

  // ---- exposed actions ----------------------------------------------------

  const lockSlot = useCallback(async (time: string) => {
    const connection = connectionRef.current;
    const group = groupRef.current;
    if (!connection || !group) return;
    if (connection.state !== HubConnectionState.Connected) return;

    setError(null);
    try {
      await connection.invoke(
        'LockSlot',
        group.doctorId,
        group.date,
        time,
      );
      setMyLockedSlot(time);
    } catch {
      setError('No se pudo bloquear el horario. Intente de nuevo.');
    }
  }, []);

  const releaseSlot = useCallback(async (time: string) => {
    const connection = connectionRef.current;
    const group = groupRef.current;
    if (!connection || !group) return;
    if (connection.state !== HubConnectionState.Connected) return;

    try {
      await connection.invoke(
        'ReleaseSlot',
        group.doctorId,
        group.date,
        time,
      );
      setMyLockedSlot(null);
    } catch {
      setError('No se pudo liberar el horario. Intente de nuevo.');
    }
  }, []);

  return {
    connectionState,
    lockedSlots,
    confirmedSlots,
    myLockedSlot,
    lockSlot,
    releaseSlot,
    error,
  };
}
