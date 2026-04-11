import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Začínám seedovat databázi...");

  const passwordHash = await bcrypt.hash("123", 10);

 
  const demoNotes = [
    {
      "id": "1",
      title: "Jak fungují API routy v NextJS",
      content: "Api routy tvoří backend v naším next.js, tedy není potřeba mít samostatný server. Soubory z pages/api jsou adresy na který se posílají data z frontendu. Ukázka - pages/api/notes/[id].ts: export default async function handler(req, res) { if (req.method === 'DELETE') { const { id } = req.query; await prisma.note.delete({ where: { id: String(id) } }); return res.status(200).json({ message: 'Smazáno' }); } }. Vysvětlení - Je to vytvoření adresy, kde se pošle DELETE požadavek. Za pomoci ID poznámky, prisma vymaže z database poznámku. Nakonec přijde zpráva 'smázáno'."
    },
    {
      "id": "2",
      title: "Co je to middleware a jak funguje v NextJS",
      content: "Middleware je kod, který se spustí jako první než se dokončí jiní požadavek na API. Ukázka: export { default } from 'next-auth/middleware'; export const config = { matcher: ['/notes/:path*', '/api/notes/:path*'] }; Vysvětlení - všechny cesty na /notes nebo /api/notes jsou hlidané. Pokud uživatel není přihlašen bude automaticky poslán na login."
    },
    {
      "id": "3",
      title: "Jak funguje prisma a CRUD",
      content: "Prisma nám slouži pro databázi a její výhoda je že nepíšeme SQL příkazy ale Typescriptu. Ukázka schématu: model User { id String @id @default(cuid()) name String @unique password String createdAt DateTime @default(now()) notes Note[] }. CRUD (create, read, update, delete): Create: prisma.note.create({ data: { title: 'Ahoj', userId: '...' } }); Read: prisma.note.findMany({ where: { userId: '...' } }); Update: prisma.note.update({ where: { id: '...' }, data: { title: 'Nový' } }); Delete: prisma.note.delete({ where: { id: '...' } })."
    },
    {
      "id": "4",
      title: "Jak funguje useForm hook",
      content: "useForm je nástroj, který pomáhá ovládat formuláře. Místo toho abych pro každé políčko dělal useState, useForm si všechna data hlídá sám, řeší validaci a odesílání. Ukázka: const { register, handleSubmit } = useForm(); const onSubmit = (data) => console.log(data); return ( <form onSubmit={handleSubmit(onSubmit)}> <input {...register('title')} /> <button type='submit'>Uložit</button> </form> ); Vysvětlení: register - Tímhle 'připojíš' input k hooku. Sleduje, co uživatel píše. onSubmit - To je funkce, která se spustí jen tehdy, když je formulář správně vyplněný."
    },
    {
      "id": "5",
      title: "Co je to NextAuth a jak se používá",
      content: "NextAuth je kompletní řešení pro přihlašování. Stará se o cookies, session, hashování hesel a propojení s databází. Ukázka: signIn('credentials', { username, password, callbackUrl: '/notes' }); Vysvětlení: Tento kód vezme údaje od uživatele a pošle je do NextAuth backendu. Ten je porovná s databází, a pokud sedí, vytvoří 'session' (přihlásí uživatele) a pošle ho na nástěnku."
    },
    {
      "id": "6",
      title: "Jak se nasazuje na Vercel",
      content: "Zaprvé musíme změnit naši databázi tedy z dockeru použít cloudovou. Já jsem použil Neon. Postup: Neon - přihlasit přes github, pojmenovat project, zvolit region (Frankfurt), vytvořit project, zkopírovat si connection string. Přihlásit se na Vercel přes github, project poslat na git, zvolit root directory našeho projektu, zvolit next.js, do environment variables v key dát database url a value bude ten string z Neonu plus ještě přidat nextAuth, dát Deployment. Když se povede, naběhne funkční webový odkaz."
    }
  ];

  const user = await prisma.user.upsert({
    where: { name: "demoHotovo" },
    update: {},
    create: {
      name: "demoHotovo",
      password: passwordHash,
      notes: {
        create: demoNotes.map((note) => ({
          title: note.title,
          content: JSON.stringify([
            {
              id: `block-${Math.random().toString(36).substr(2, 9)}`,
              type: "paragraph",
              props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
              content: [{ type: "text", text: note.content, styles: {} }],
              children: [],
            },
          ]),
        })),
      },
    },
  });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });