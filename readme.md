# DineVibe Mashup
En interaktiv webbapplikation som matchar musik med recept baserat på låtens längd.

## Funktioner
* Spotify Integration: Hämtar realtidsdata om låtar (artist, omslag och längd).
* Spoonacular API: Matchar musikens karaktär med passande recept (till exempel långkok för långa låtar).
* Animationer: 
  - Beavis och Butt-Head visas vid korta, snabba låtar.
  - Dansande sniglar visas vid de längsta låtarna.
  - Tvingad laddningsanimation vid sökning
* Responsiv Design: Anpassad för både mobil och desktop.

## Teknikstack
* Frontend: HTML5, SCSS (Sass), JavaScript (ES6+).
* Build tool: Vite.
* Deployment: GitHub Actions och GitHub Pages.
* API:er: Spotify Web API, Spoonacular Food API.

## Säkerhet och Konfiguration
Projektet använder en separat fil, `config.js`, för att hantera API-nycklar mot Spotify och Spoonacular. 

* **Hantering av nycklar:** Nycklarna importeras som konstanter för att separera känslig data från logiken i `main.js`. 
* **Versionshantering:** Filen har lämnats publik för att underlätta rättning och testning, då inga betaltjänster är kopplade till de använda API-kontona.

## Dokumentation
Teknisk dokumentation:
[Läs projektets tekniska dokumentation här](https://runegranath.github.io/Projekt-FB-W/docs/index.html)

## Installation och Uppstart
1. Klona arkivet:
   ```bash
   git clone [https://github.com/runegranath/Projekt-FB-W.git](https://github.com/runegranath/Projekt-FB-W.git)