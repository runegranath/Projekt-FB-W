import "./style.scss";

import { keys } from "./config.js";

const SPOON_KEY = keys.SPOON_KEY;
const SPOT_ID = keys.SPOT_ID;
const SPOT_SECRET = keys.SPOT_SECRET;

const matchBtn = document.getElementById("match-btn");
const trackContainer = document.getElementById("track-container");
const recipeContainer = document.getElementById("recipe-container");

async function getSpotifyToken() {
  const url = "https://accounts.spotify.com/api/token";
  const auth = btoa(`${SPOT_ID}:${SPOT_SECRET}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

async function getMusicMood(searchTerm) {
  try {
    const token = await getSpotifyToken();

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const searchData = await searchRes.json();
    const track = searchData.tracks.items[0];

    if (!track) return null;

    const minutes = track.duration_ms / 1000 / 60;

    let lengthScore = minutes / 5;
    if (lengthScore > 1) lengthScore = 1;

    return {
      name: track.name,
      artist: track.artists[0].name,
      image: track.album.images[0].url,
      energy: lengthScore,
    };
  } catch (error) {
    console.error("Spotify-fel:", error);
    return null;
  }
}

async function fetchRecipe(query) {
  const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=1&apiKey=${SPOON_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results && data.results.length > 0 ? data.results[0] : null;
  } catch (error) {
    console.error("Spoonacular-fel:", error);
    return null;
  }
}

function renderResults(music, recipe) {
  trackContainer.innerHTML = `
    <div class="card">
      <h2>Musik-analys</h2>
      <div class="music-info">
        <img src="${music.image}" alt="Album cover" style="width:100px; border-radius:10px; margin-bottom:15px;">
        <p>Låt: <strong>${music.name}</strong></p>
        <p>Artist: <strong>${music.artist}</strong></p>
        <p>Låtens längdfaktor: <strong>${Math.round(music.energy * 100)}%</strong></p>
      </div>
    </div>
  `;

  recipeContainer.innerHTML = `
    <div class="card">
      <h2>Rekommenderat recept</h2>
      <h3>${recipe.title}</h3>
      <img src="${recipe.image}" alt="${recipe.title}" style="width:100%; border-radius:10px; margin: 15px 0;">
      <p>
        ${
          music.energy > 0.7
            ? "Denna låt är ett riktigt <strong>epos</strong>! Eftersom du har tid att lyssna på en lång låt, föreslår vi ett recept som får ta sin lilla tid."
            : "Denna låt är <strong>kort och effektiv</strong>! Därför matchar vi den med ett recept som går snabbt att slänga ihop."
        }
      </p>
    </div>
  `;
}

async function getMashupData() {
  const songInput = document.getElementById("song-input");
  const searchTerm = songInput.value;

  if (!searchTerm) {
    alert("Skriv in en låt först!");
    return;
  }

  try {
    document.body.classList.add("is-loading");
    trackContainer.innerHTML = "Analyserar musik-rytmen...";
    recipeContainer.innerHTML = "Letar efter matchande smaker...";

    const music = await getMusicMood(searchTerm);
    if (!music) {
      trackContainer.innerHTML = "Hittade ingen låt. Prova något annat!";
      recipeContainer.innerHTML = "";
      return;
    }

    let foodQuery = "fast food"; 

    if (music.energy > 0.7) {
      foodQuery = "stew"; 
    } else if (music.energy > 0.4) {
      foodQuery = "pasta";
    }
    const recipe = await fetchRecipe(foodQuery);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (recipe) {
      renderResults(music, recipe);
    } else {
      recipeContainer.innerHTML = "Hittade tyvärr inget recept just nu.";
    }
  } catch (error) {
    console.error("Huvudfel:", error);
  } finally {
    document.body.classList.remove("is-loading");
  }
}

matchBtn.addEventListener("click", getMashupData);

const songInput = document.getElementById("song-input");

songInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    getMashupData();
  }
});
