import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Začínám seedovat databázi...');

  // 1. Vytvoříme zahashované heslo pro demo uživatele (podle zadání: demo1234)
  const hashedPassword = await hash('demo1234', 12);

  // 2. Použijeme 'upsert' - vytvoří uživatele, pokud neexistuje. 
  // Pokud už existuje, neudělá nic (aby skript nepadal při opakovaném spuštění).
  const demoUser = await prisma.user.upsert({
    where: { name: 'demo' },
    update: {},
    create: {
      name: 'demo',
      password: hashedPassword,
      notes: {
        create: [
          {
            title: 'Vítejte v Chytrých Poznámkách!',
            content: JSON.stringify([
              {
                type: "paragraph",
                content: [{ type: "text", text: "Toto je vaše první ukázková poznámka. Zkuste si ji upravit!" }]
              }
            ])
          },
          {
            title: 'Tajný plán na víkend',
            content: JSON.stringify([
              {
                type: "paragraph",
                content: [{ type: "text", text: "1. Vydat skvělý školní projekt." }]
              },
              {
                type: "paragraph",
                content: [{ type: "text", text: "2. Odpočívat." }]
              }
            ])
          }
        ]
      }
    }
  });

  console.log(`Hotovo! Demo uživatel vytvořen: ${demoUser.name}`);
}

main()
  .catch((e) => {
    console.error('Chyba při seedování:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });