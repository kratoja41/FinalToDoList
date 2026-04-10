import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.sub) {
    return res.status(401).json({ message: "Neautorizováno" });
  }

  const userId = token.sub;
  const noteId = req.query.id as string; 

  
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  
  if (!note || note.userId !== userId) {
    return res.status(404).json({ message: "Poznámka nenalezena nebo k ní nemáte přístup." });
  }

  
  if (req.method === "GET") {
    return res.status(200).json(note);
  }

  
  if (req.method === "PUT") {
    const { title, content } = req.body;
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Titulek je povinný." });
    }

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: { title, content },
    });
    return res.status(200).json(updatedNote);
  }

  
  if (req.method === "DELETE") {
    await prisma.note.delete({ where: { id: noteId } });
    return res.status(204).end(); 
  }

  return res.status(405).json({ message: "Metoda nepovolena." });
}