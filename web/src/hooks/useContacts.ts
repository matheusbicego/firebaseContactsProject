import { useCallback, useEffect, useState } from "react";
import type { ContactData } from "../entities/Contact";
import { getAllContacts } from "../services/contacts";

export default function useContacts(initialUid?: string) {
  const [contacts, setContacts] = useState<Array<{ id: string; data: ContactData }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchContacts = useCallback(
    async (uid?: string) => {
      const effectiveUid = uid ?? initialUid;
      if (!effectiveUid) return;
      setLoading(true);
      try {
        const all = await getAllContacts(effectiveUid);
        setContacts(all);
        return all;
      } finally {
        setLoading(false);
      }
    },
    [initialUid],
  );

  useEffect(() => {
    if (initialUid) fetchContacts(initialUid);
  }, [initialUid, fetchContacts]);

  return {
    contacts,
    setContacts,
    loading,
    fetchContacts,
  } as const;
}
