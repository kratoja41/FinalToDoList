import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token || !token.sub) {
    return res.status(401).json({ message: "Neautorizovaný přístup. Musíte se přihlásit." });
  }

  const userId = token.sub; 

  
  if (req.method === "GET") {
    try {
      const notes = await prisma.note.findMany({
        where: { userId: userId },
        orderBy: { updatedAt: "desc" }, 
      });
      return res.status(200).json(notes);
    } catch (error) {
      return res.status(500).json({ message: "Chyba při načítání poznámek." });
    }
  }

  
  if (req.method === "POST") {
    const { title, content } = req.body;

    
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Titulek poznámky je povinný." });
    }

    try {
      const newNote = await prisma.note.create({
        data: {
          title: title,
          content: content || "",
          userId: userId, 
        },
      });
      return res.status(201).json(newNote);
    } catch (error) {
      return res.status(500).json({ message: "Chyba při vytváření poznámky." });
    }
  }

  
  return res.status(405).json({ message: "Metoda nepovolena." });
}