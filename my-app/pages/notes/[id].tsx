import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

// --- HLAVNÍ KOMPONENTA (Stará se o načtení dat) ---
export default function EditNotePage() {
  const router = useRouter();
  const { id } = router.query;
  const { status } = useSession();
  const [noteData, setNoteData] = useState<{ title: string; content: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (id && status === "authenticated") {
      fetch(`/api/notes/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Poznámka nenalezena nebo nemáte přístup.");
          return res.json();
        })
        .then((data) => setNoteData(data))
        .catch((err) => setError(err.message));
    }
  }, [id, status]);

  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center p-8 text-red-600 text-center bg-gray-50">
      <h2 className="text-xl font-bold mb-4">{error}</h2>
      <Link href="/notes" className="text-blue-600 underline">Zpět na nástěnku</Link>
    </div>;
  }

  // Dokud nemáme data, ukazujeme načítání
  if (status !== "authenticated" || !noteData) {
    return <div className="min-h-screen flex items-center justify-center text-black bg-gray-50">Načítám poznámku...</div>;
  }

  // Jakmile máme data, zobrazíme samotný editor
  return <EditNoteForm noteId={id as string} initialTitle={noteData.title} initialContent={noteData.content} />;
}

// --- KOMPONENTA FORMULÁŘE (Stará se o samotný BlockNote a tlačítka) ---
function EditNoteForm({ noteId, initialTitle, initialContent }: { noteId: string, initialTitle: string, initialContent: string | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState("");

  // Pokusíme se převést uložený text zpět na JSON pro BlockNote
  const parsedContent = initialContent ? JSON.parse(initialContent) : undefined;
  const editor = useCreateBlockNote({ initialContent: parsedContent });

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: JSON.stringify(editor.document) }),
    });

    if (res.ok) router.push("/notes");
    else setError("Chyba při ukládání poznámky.");
  };

  const handleDelete = async () => {
    // Vyskakovací okno pro potvrzení (aby si to uživatel nesmazal omylem)
    if (!window.confirm("Opravdu chcete tuto poznámku nenávratně smazat?")) return;

    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) router.push("/notes");
    else setError("Chyba při mazání poznámky.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Úprava poznámky</h1>
          <Link href="/notes" className="text-gray-500 hover:text-gray-800 underline">Zpět na nástěnku</Link>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleUpdate}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Titulek poznámky</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6 border border-gray-300 rounded p-2 min-h-[300px]">
            <BlockNoteView editor={editor} theme="light" />
          </div>

         <div className="flex flex-col sm:flex-row gap-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm">
              Uložit změny
            </button>
            
            {/* Nové tlačítko pro stažení této konkrétní poznámky */}
            <a 
              href={`/api/notes/export?id=${noteId}`} 
              download 
              className="flex-1 sm:flex-none text-center bg-gray-800 text-white p-3 rounded-lg font-bold hover:bg-gray-900 transition shadow-sm px-8"
            >
              ↓ Stáhnout JSON
            </a>

            <button type="button" onClick={handleDelete} className="flex-1 sm:flex-none bg-red-100 text-red-600 p-3 rounded-lg font-bold hover:bg-red-200 transition shadow-sm px-6">
              Smazat
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}