"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6">Caricamento…</div>;
  if (!email) return <div className="p-6">Devi essere loggato per vedere questa pagina.</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Area Admin</h1>
      <div className="text-sm text-neutral-700">Utente: <b>{email}</b></div>
      <p className="text-sm">Qui poi aggiungeremo la gestione eventi.</p>
    </div>
  );
}
