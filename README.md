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
2. **Migrace:**  npx prisma migrate dev --name init
3. **Seedování:** npm run seed
4. **Start:** npm run dev 

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
