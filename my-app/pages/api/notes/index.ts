import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Ověření, zda je uživatel přihlášený (ověření session přes token)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token || !token.sub) {
    return res.status(401).json({ message: "Neautorizovaný přístup. Musíte se přihlásit." });
  }

  const userId = token.sub; // ID aktuálně přihlášeného uživatele

  // 2. GET: Výpis poznámek (uživatel dostane POUZE své poznámky)
  if (req.method === "GET") {
    try {
      const notes = await prisma.note.findMany({
        where: { userId: userId },
        orderBy: { updatedAt: "desc" }, // Nejnovější nahoře
      });
      return res.status(200).json(notes);
    } catch (error) {
      return res.status(500).json({ message: "Chyba při načítání poznámek." });
    }
  }

  // 3. POST: Vytvoření nové poznámky
  if (req.method === "POST") {
    const { title, content } = req.body;

    // Validace: Titulek nesmí být prázdný (požadavek ze zadání)
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Titulek poznámky je povinný." });
    }

    try {
      const newNote = await prisma.note.create({
        data: {
          title: title,
          content: content || "",
          userId: userId, // Poznámku napevno přiřadíme přihlášenému uživateli!
        },
      });
      return res.status(201).json(newNote);
    } catch (error) {
      return res.status(500).json({ message: "Chyba při vytváření poznámky." });
    }
  }

  // Pokud někdo zkusí jinou metodu (např. PUT, DELETE tady na indexu)
  return res.status(405).json({ message: "Metoda nepovolena." });
}