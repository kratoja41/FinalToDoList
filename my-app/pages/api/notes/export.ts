import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Metoda nepovolena" });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.sub) {
    return res.status(401).json({ message: "Neautorizováno" });
  }

  const userId = token.sub;
  const { id } = req.query; 

  try {
    let dataToExport;
    let filename = "";
    
    
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    if (id) {
      
      const note = await prisma.note.findUnique({ where: { id: String(id) } });
      if (!note || note.userId !== userId) {
        return res.status(404).json({ message: "Poznámka nenalezena" });
      }
      
      
      const { userId: _, ...exportNote } = note;
      dataToExport = exportNote;
      filename = `note-${id}-${dateStr}.json`;
      
    } else {
      
      const notes = await prisma.note.findMany({ where: { userId } });
      dataToExport = notes.map(note => {
        const { userId: _, ...exportNote } = note;
        return exportNote;
      });
      filename = `notes-export-${dateStr}.json`;
    }

    
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    
    
    return res.status(200).send(JSON.stringify(dataToExport, null, 2));

  } catch (error) {
    return res.status(500).json({ message: "Chyba při exportu dat" });
  }
}