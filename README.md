# FinalToDoList


## instalace

Pro spuštění projektu potřebujete mít nainstalované:
* **Node.js** 
* **Docker Desktop** 

 ## Spuštění projektu 
 1 Klonujte repozitář: git clone https://github.com/kratoja41/FinalToDoList.git
 2. Přejděte do složky projektu: cd my-app
 3. Nainstalujte knihovny: npm install
 4. Spusťte aplikaci: npm run dev

##  Konfigurace (.env)
* Vzorový soubor s popisem proměnných naleznete v .env.example
* Pro běh aplikace vytvořte soubor .env a vyplňte v něm DATABASE_URL  a NEXTAUTH_SECRET

## Migrace a spuštění (lokálně)

1. **Příprava DB:** Spusťte Docker
2. **Inicializujte Prisma:**  npx prisma init
3. **Nakonfigurujte .env soubor s připojovacím řetězcem:** DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
4. **Migrace:**  npx prisma migrate dev --name init
5. **Vygenerujte Prisma Client:**  npx prisma generate
6. **Seedování:** npm run seed
7. **Start:** npm run dev 

## Demo uživatel
V rámci seed skriptu je vytvořen uživatel pro rychlé testování:
* **Uživatelské jméno:**  demoHotovo
* **Heslo:**  123


##  Export a Import
Aplikace umožňuje přenos dat  JSON:
* **Export:** Všechny poznámky: Na hlavní stránce je tlačítko "Exportovat vše JSON"
              Jedna poznámka: rozkliknout poznámku a tam najdete tlačítko "stáhnout JSON"
* **Import:* Na hlavní stránce je tlačítko "importovat JSON"

## Vercel 
https://final-to-do-list-git-main-kratoja41s-projects.vercel.app/
