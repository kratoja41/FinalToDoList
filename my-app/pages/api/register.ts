import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/hash";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metoda nepovolena" });
  }

  const { name, password } = req.body;

  
  if (!name || name.trim() === "" || !password || password.trim() === "") {
    return res.status(400).json({ message: "Jméno a heslo jsou povinné." });
  }

  try {
    
    const existingUser = await prisma.user.findUnique({
      where: { name: name },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Toto jméno už je zabrané." });
    }

    
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name,
        password: hashedPassword,
      },
    });

    
    return res.status(201).json({ message: "Uživatel úspěšně vytvořen", userId: user.id });

  } catch (error) {
    return res.status(500).json({ message: "Něco se pokazilo na serveru." });
  }
}