import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/hash";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Povolíme pouze metodu POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metoda nepovolena" });
  }

  const { name, password } = req.body;

  // Základní validace (Zadání: nepovolené prázdné hodnoty)
  if (!name || name.trim() === "" || !password || password.trim() === "") {
    return res.status(400).json({ message: "Jméno a heslo jsou povinné." });
  }

  try {
    // Zkontrolujeme, zda uživatel se stejným jménem už neexistuje
    const existingUser = await prisma.user.findUnique({
      where: { name: name },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Toto jméno už je zabrané." });
    }

    // Zahashujeme heslo a vytvoříme uživatele
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name,
        password: hashedPassword,
      },
    });

    // Vrátíme úspěch (201 Created), ale nikdy nevracíme heslo!
    return res.status(201).json({ message: "Uživatel úspěšně vytvořen", userId: user.id });

  } catch (error) {
    return res.status(500).json({ message: "Něco se pokazilo na serveru." });
  }
}