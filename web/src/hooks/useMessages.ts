import { useCallback, useEffect, useState } from "react";
import { getAllMessages } from "../services/messages";
import type { MessageData } from "../entities/Messages";

export default function useMessages(initialUid?: string) {
  const [messages, setMessages] = useState<Array<{ id: string; data: MessageData }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(
    async (uid?: string) => {
      const effectiveUid = uid ?? initialUid;
      if (!effectiveUid) return;
      setLoading(true);
      try {
        const all = await getAllMessages(effectiveUid);
        setMessages(all);
        return all;
      } finally {
        setLoading(false);
      }
    },
    [initialUid],
  );

  useEffect(() => {
    if (initialUid) fetchMessages(initialUid);
  }, [initialUid, fetchMessages]);

  return {
    messages,
    setMessages,
    loading,
    fetchMessages,
  } as const;
}
