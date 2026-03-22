import "./style.scss";
import fastPlayGif from "./assets/bb.gif";
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
  let timeText = "";
  let isShort = false;
  let isLongest = false;

  if (music.energy >= 1.0) {
    timeText =
      "Vad sägs om ett <strong>långkok</strong> för en lång låt? Det verkar som du har gott om tid!";
    isLongest = true;
  } else if (music.energy >= 0.8) {
    timeText =
      "En <strong>rejäl låt på drygt 4 minuter</strong> kräver en ordentlig middag som matchar energin.";
  } else if (music.energy >= 0.5) {
    timeText =
      "Med en låtlängd på <strong>runt 3 minuter</strong> passar det perfekt med en klassisk pasta.";
  } else {
    timeText =
      "Den här låten är <strong>snabb och kort!</strong> Vi kör på ett snabbt recept innan den tar slut.";
    isShort = true;
  }

  trackContainer.innerHTML = `
    <div class="card">
      <h2>Musik-analys</h2>
      <div class="music-info">
        <img src="${music.image}" alt="Album cover" style="width:100px; border-radius:10px; margin-bottom:15px; border: 2px solid #5b23ff;">
        <p>Låt: <strong>${music.name}</strong></p>
        <p>Artist: <strong>${music.artist}</strong></p>
        <p>Låtens längdfaktor: <strong>${Math.round(music.energy * 100)}%</strong></p>
      </div>
    </div>
  `;

  recipeContainer.innerHTML = `
    <div class="card">
      <h2>Recept-matchning</h2>
      <h3>${recipe.title}</h3>
      <img src="${recipe.image}" alt="${recipe.title}" style="width:100%; border-radius:10px; margin: 15px 0; border: 2px solid #5b23ff;">
      
      <div class="recipe-match-content">
        <p class="recipe-text">${timeText}</p>
      </div>
      
      ${recipe.sourceUrl ? `<a href="${recipe.sourceUrl}" target="_blank" class="recipe-link" style="margin-top:15px; display:inline-block;">Se hela receptet</a>` : ""}
    </div>
  `;

  if (isShort) {
    if (typeof fastPlayGif !== "undefined") {
      const gifEl = document.createElement("img");
      gifEl.src = fastPlayGif;
      gifEl.alt = "Beavis & Butt-Head fast play";
      gifEl.classList.add("fastplay-gif");

      document.body.appendChild(gifEl);

      setTimeout(() => {
        gifEl.classList.add("hide");

        setTimeout(() => {
          if (gifEl.parentNode) {
            gifEl.parentNode.removeChild(gifEl);
          }
        }, 500);
      }, 5000);
    }
  }

  if (isLongest) {
    const snailsContainer = document.createElement("div");
    snailsContainer.classList.add("snails-container");

    for (let i = 0; i < 6; i++) {
      const snailEl = document.createElement("div");
      snailEl.classList.add("dancing-snail");
      snailEl.textContent = "🐌";
      snailsContainer.appendChild(snailEl);
    }

    document.body.appendChild(snailsContainer);

    setTimeout(() => {
      snailsContainer.classList.add("hide");
      setTimeout(() => {
        if (snailsContainer.parentNode)
          snailsContainer.parentNode.removeChild(snailsContainer);
      }, 500);
    }, 5000);
  }
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

    let foodQuery = "";

    if (music.energy >= 1.0) {
      foodQuery = "slow cook";
    } else if (music.energy >= 0.8) {
      foodQuery = "dinner";
    } else if (music.energy >= 0.5) {
      foodQuery = "pasta";
    } else {
      foodQuery = "snack";
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
