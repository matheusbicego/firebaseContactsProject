import { useCallback, useEffect, useState } from "react";
import { getAllConnections } from "../services/connections";
import type { ConnectionData } from "../entities/Connections";

export default function useConnections(initialUid?: string) {
  const [connections, setConnections] = useState<Array<{ id: string; data: ConnectionData }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchConnections = useCallback(
    async (uid?: string) => {
      const effectiveUid = uid ?? initialUid;
      if (!effectiveUid) return;
      setLoading(true);
      try {
        const all = await getAllConnections(effectiveUid);
        setConnections(all);
        return all;
      } finally {
        setLoading(false);
      }
    },
    [initialUid],
  );

  useEffect(() => {
    if (initialUid) fetchConnections(initialUid);
  }, [initialUid, fetchConnections]);

  return {
    connections,
    setConnections,
    loading,
    fetchConnections,
  } as const;
}
