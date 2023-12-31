const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const clientId = '6c2bcf559f894a4eb3eb2196e99345af';
const redirectUri = 'http://localhost:5500/home.html';

const scope = 'user-read-private user-read-email user-top-read';
const authUrl = new URL("https://accounts.spotify.com/authorize")

async function loginWithSpotifyClick() {
  //const codeVerifier = generateRandomString(64);
  const codeVerifier = "5244567880392765432112345678900987654321123456789009876543211234";
  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64encode(hashed);

  // generated in the previous step
  localStorage.setItem('code_verifier', codeVerifier);

  const params =  {
    response_type: 'code',
    client_id: clientId,
    scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  }

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}


const tokenEndpoint = "https://accounts.spotify.com/api/token";
const getToken = async code => {

  // stored in the previous step
  //let codeVerifier = localStorage.getItem('code_verifier');
  //console.log(codeVerifier);
  let codeVerifier = "5244567880392765432112345678900987654321123456789009876543211234";
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  }

  const body = await fetch(tokenEndpoint, payload);
  const response = await body.json();
  localStorage.setItem('access_token', response.access_token);
}

/* Spotify API Calls */
async function fetchWebApi(endpoint) {
  let token = localStorage.getItem('access_token');
  const response = await fetch(`https://api.spotify.com/${endpoint}`, {
    method: 'GET',
    headers: { 
      'Authorization': 'Bearer ' + token 
    },
  });
  return await response.json();
}

async function getUserData() {
  let token = localStorage.getItem('access_token');
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  });

  return await response.json();
}

const topTracksIds = [];

async function getTopArtists(){
  let token = localStorage.getItem('access_token');
  const response = await fetch("https://api.spotify.com/v1/me/top/artists?limit=10", {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  });

  return await response.json();
}

function loadArtists(items) {
  const artistBoxTemplate = document.getElementById("artist-box-template");
  const artists = document.getElementById("artists");
  items.forEach(i =>
  {
    let item = artistBoxTemplate.content.cloneNode(true)
    item.getElementById("artist-image").src = i.images[0].url;
    item.getElementById("artist-name").textContent = i.name;
    artists.append(item);
  })
}

async function printTopArtists() {
  const topArtists = await getTopArtists();
  //console.log(topTracks.items);
  //console.log(
  //  topTracks?.map(
  //    ({name, artists}) =>
  //      `${name} by ${artists.map(artist => artist.name).join(', ')}`
  //  )
  //);
  loadArtists(topArtists.items);
}

async function getRecommendations(topTracksIds){
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-recommendations
  const searchParams = new URLSearchParams();

  let token = localStorage.getItem('access_token');
  const response = await fetch('https://api.spotify.com/v1/recommendations?limit=10&seed_tracks=' + topTracksIds[0], {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  });
  console.log(response);
  return await response.json();
}

async function getTopTracks() {
  let token = localStorage.getItem('access_token');
  const response = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=10", {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  });
  return await response.json();
}

async function getArtistsInfo(artistIds) {
  let token = localStorage.getItem('access_token');
  const response = await fetch("https://api.spotify.com/v1/artists?ids=" + artistIds.join(","), {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token },
  });
  return await response.json();
}

async function printRecommendations() {
  const topTracks = (await getTopTracks()).items;
  const topTracksIds = [];
  topTracks.forEach(i =>
  {
    topTracksIds.push(i.id);
  })
  console.log(topTracksIds);
  const recommendedTracks = (await getRecommendations(topTracksIds)).tracks;
  console.log(
    recommendedTracks.map(
      ({name, artists}) =>
        `${name} by ${artists.map(artist => artist.name).join(', ')}`
    )
  );
  const artistIds = [];
  recommendedTracks.forEach(i =>
  {
    artistIds.push(i.artists[0].id);
  })
  const artists = (await getArtistsInfo(artistIds)).artists;
  loadArtists(artists);
}

const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get('code');

if (code) {
  await getToken(code);
  //console.log(localStorage.getItem('access_token'));

  // Remove code from URL so we can refresh correctly.
  const url = new URL(window.location.href);
  url.searchParams.delete("code");

  const updatedUrl = url.search ? url.href : url.href.replace('?', '');
  window.history.replaceState({}, document.title, updatedUrl);
}

const loginButton = document.getElementById("login-button");
if (loginButton != null) {
  loginButton.onclick=async() => {
    await loginWithSpotifyClick();
  };
}


const artistButton = document.getElementById("artist-button");
if (artistButton != null) {
    artistButton.onclick=async() => {
    await printRecommendations();
  };
}