import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { status } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-black">
      <Head>
        <title>Chytré Poznámky</title>
      </Head>

      <main className="text-center max-w-2xl bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-600">
          Chytré Poznámky
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Vaše osobní místo pro ukládání myšlenek, nápadů a úkolů. 
          Vše je bezpečně uloženo a přístupné odkudkoliv.
        </p>

        {/* Podle toho, zda je uživatel přihlášený, ukážeme příslušná tlačítka */}
        {status === "loading" ? (
          <div className="text-gray-500 font-medium">Načítám...</div>
        ) : status === "authenticated" ? (
          <Link href="/notes" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-md">
            Přejít na nástěnku
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
              Přihlásit se
            </Link>
            <Link href="/register" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
              Vytvořit účet
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}