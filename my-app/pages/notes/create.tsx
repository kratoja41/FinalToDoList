import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession } from "next-auth/react";

// NOVÉ SPRÁVNÉ IMPORTY:
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export default function CreateNote() {
  const router = useRouter();
  const { status } = useSession();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  
  // Ochrana proti chybám při renderování editoru na serveru (SSR)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // Inicializace profi editoru BlockNote
  const editor = useCreateBlockNote();

  // Pokud uživatel není přihlášený, přesměrujeme ho
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Titulek je povinný.");
      return;
    }

    // Obsah editoru převedeme na text (JSON), abychom ho mohli uložit do databáze
    const content = JSON.stringify(editor.document);

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (res.ok) {
      // Po úspěšném uložení ho hodíme zpět na nástěnku
      router.push("/notes");
    } else {
      const data = await res.json();
      setError(data.message || "Chyba při ukládání poznámky.");
    }
  };

  // Zatímco se stránka načítá, neukazujeme nic (aby neblikl neostylovaný obsah)
  if (!isMounted || status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Nová poznámka</h1>
          <Link href="/notes" className="text-gray-500 hover:text-gray-800 underline">
            Zpět na nástěnku
          </Link>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Titulek */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Titulek poznámky</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Např. Nákupní seznam, Nápady na projekt..."
              required
            />
          </div>

          {/* BlockNote Editor */}
          <div className="mb-6 border border-gray-300 rounded p-2 min-h-[300px]">
            <BlockNoteView editor={editor} theme="light" />
          </div>

          {/* Tlačítko pro uložení */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Uložit poznámku
          </button>
        </form>

      </div>
    </div>
  );
}