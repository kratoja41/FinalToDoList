import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metoda nepovolena" });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.sub) {
    return res.status(401).json({ message: "Neautorizováno" });
  }

  const userId = token.sub;

  try {
    const body = req.body;
    
    // Převedeme vstup vždy na pole, abychom s ním mohli jednotně pracovat
    const notesToImport = Array.isArray(body) ? body : [body];

    // Očistíme data a připravíme je pro databázi (ignorujeme cizí userId z importu)
    const validNotes = notesToImport
      .filter((note: any) => note.title && typeof note.title === "string" && note.title.trim() !== "")
      .map((note: any) => ({
        title: note.title,
        content: note.content || "",
        userId: userId, // Přiřadíme aktuálnímu uživateli!
        // Prisma se automaticky postará o createdAt a updatedAt, pokud nejsou zadány
      }));

    if (validNotes.length === 0) {
      return res.status(400).json({ message: "Nenalezeny žádné validní poznámky k importu. Titulek je povinný." });
    }

    // Uložíme všechny platné poznámky najednou
    await prisma.note.createMany({
      data: validNotes,
    });

    return res.status(200).json({ message: `Úspěšně naimportováno ${validNotes.length} poznámek.` });

  } catch (error) {
    return res.status(500).json({ message: "Chyba při importu dat. Zkontrolujte formát JSON." });
  }
}