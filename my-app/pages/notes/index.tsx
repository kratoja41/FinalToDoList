import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

// Pomocná funkce pro extrakci čistého textu z BlockNote JSONu
const extractPlainText = (contentJson: string | null) => {
  if (!contentJson) return "Bez obsahu...";
  try {
    const blocks = JSON.parse(contentJson);
    if (!Array.isArray(blocks)) return contentJson;

    let text = "";
    for (const block of blocks) {
      if (block.content && Array.isArray(block.content)) {
        for (const inline of block.content) {
          if (inline.type === "text" && inline.text) {
            text += inline.text + " ";
          }
        }
      }
    }
    return text.trim() || "Bez obsahu...";
  } catch (e) {
    // Pokud to náhodou není JSON, vrátíme to jako obyčejný text
    return contentJson;
  }
};
// Typ pro naši poznámku
type Note = {
  id: string;
  title: string;
  content: string | null;
  updatedAt: string;
};

export default function NotesDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  // ... (tvůj stávající kód nahoře)
  const [isLoading, setIsLoading] = useState(true);

  // NOVÁ FUNKCE PRO IMPORT
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Přečteme obsah souboru
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Pošleme to na naše nové API
      const res = await fetch("/api/notes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      if (res.ok) {
        alert("Import proběhl úspěšně!");
        window.location.reload(); // Pro zjednodušení obnovíme stránku
      } else {
        const data = await res.json();
        alert("Chyba importu: " + data.message);
      }
    } catch (err) {
      alert("Chyba při čtení souboru. Ujistěte se, že jde o validní JSON.");
    }
  };

  
  // Ochrana routy - pokud není přihlášený, přesměrujeme ho pryč
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // Pokud je přihlášený, stáhneme jeho poznámky z API
      fetch("/api/notes")
        .then((res) => res.json())
        .then((data) => {
          setNotes(data);
          setIsLoading(false);
        });
    }
  }, [status, router]);

  // Zatímco zjišťujeme, zda je přihlášený, ukážeme načítání
  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-black">Načítám...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* Hlavička */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold">Moje poznámky</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Přihlášen jako: <b>{session?.user?.name}</b></span>
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition"
            >
              Odhlásit se
            </button>
          </div>
        </div>

       {/* Tlačítka pro akce */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <Link href="/notes/create" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
            + Nová poznámka
          </Link>
          
          <a href="/api/notes/export" download className="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-900 transition">
            ↓ Exportovat vše (JSON)
          </a>

          <div>
            <label className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-50 transition cursor-pointer">
              ↑ Importovat (JSON)
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>

        {/* Výpis poznámek */}
        {notes.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm">
            Zatím nemáte žádné poznámky. Zkuste vytvořit první!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Link href={`/notes/${note.id}`} key={note.id} className="block">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer h-full">
                  <h2 className="font-bold text-lg mb-2 truncate">{note.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-3">
  {extractPlainText(note.content)}
</p>
                  <div className="mt-4 text-xs text-gray-400">
                    Upraveno: {new Date(note.updatedAt).toLocaleDateString("cs-CZ")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}   