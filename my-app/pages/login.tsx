import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Použijeme zabudovanou funkci signIn z NextAuth
    const res = await signIn("credentials", {
      redirect: false, // Nechceme automatický refresh stránky při chybě
      name,
      password,
    });

    if (res?.error) {
      // Zobrazíme chybu, kterou jsme definovali v [...nextauth].ts
      setError(res.error);
    } else {
      // Úspěch! Přesměrujeme uživatele na stránku s poznámkami
      router.push("/notes");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Přihlášení</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Jméno</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Heslo</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 font-medium"
          >
            Přihlásit se
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Nemáte ještě účet? <Link href="/register" className="text-blue-600 hover:underline">Zaregistrujte se</Link>
        </p>
      </div>
    </div>
  );
}