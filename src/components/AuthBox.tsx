"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/useAuth";

export default function AuthBox() {
  const { email, setEmail } = useAuth();
  const [input, setInput] = useState("");

  // Legge la sessione all'avvio e si sottoscrive ai cambi
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const em = data.session?.user?.email ?? null;
      setEmail(em);
      if (em) setInput(em);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      const em = sess?.user?.email ?? null;
      setEmail(em);
      if (em) setInput(em);
    });
    return () => sub.subscription.unsubscribe();
  }, [setEmail]);

  async function login() {
    if (!input) return alert("Inserisci la tua email");
    const { error } = await supabase.auth.signInWithOtp({
      email: input,
      options: {
        // dopo il click sull'email torni qui
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) return alert("Errore: " + error.message);
    alert("Ti ho inviato un link di accesso. Controlla la posta 👍");
  }

  async function logout() {
    await supabase.auth.signOut();
    setEmail(null);
  }

  return (
    <div className="rounded border p-3 space-y-2">
      <div className="font-medium">Accesso</div>
      {email ? (
        <>
          <div className="text-sm text-neutral-700">
            Sei loggato come <b>{email}</b>
          </div>
          <button onClick={logout} className="rounded border px-3 py-1">Esci</button>
        </>
      ) : (
        <>
          <input
            type="email"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="tua@email.com"
            className="w-full rounded border p-2"
          />
          <button onClick={login} className="w-full rounded border px-3 py-1">
            Invia link di accesso
          </button>
          <p className="text-xs text-neutral-500">Riceverai un link via email. Cliccalo e torni qui loggato.</p>
        </>
      )}
    </div>
  );
}
