/**
 * GITHUB-API-HELFER
 * -----------------------------------------------------------
 * Kapselt alle Zugriffe auf die GitHub Contents API. Der Admin-Bereich
 * liest/schreibt darüber direkt die js/*-data.js-Dateien und lädt Fotos
 * nach assets/ hoch — jede Änderung landet als eigener Commit im Repo.
 *
 * Der GitHub-Token wird NIE hier hinterlegt, sondern kommt aus
 * sessionStorage/localStorage (siehe admin-login.js).
 */

const GH_API = "https://api.github.com";

function getGithubToken() {
  return sessionStorage.getItem("gh_admin_token") || localStorage.getItem("gh_admin_token");
}

// ---------- Base64 / UTF-8 Hilfsfunktionen ----------

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function utf8ToBase64(str) {
  return arrayBufferToBase64(new TextEncoder().encode(str).buffer);
}

function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function sha256Hex(message) {
  const data = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- GitHub-Requests ----------

async function ghFetch(path, options = {}) {
  const token = getGithubToken();
  if (!token) throw new Error("Kein GitHub-Token vorhanden. Bitte neu einloggen.");
  return fetch(`${GH_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
}

async function ghCheckAccess() {
  const repo = window.GITHUB_REPO;
  const res = await ghFetch(`/repos/${repo}`);
  if (res.status === 401) throw new Error("Der GitHub-Token ist ungültig oder abgelaufen.");
  if (res.status === 404) {
    throw new Error(
      "Repo nicht gefunden. Prüfe GITHUB_REPO in admin/js/admin-config.js und ob der Token Zugriff auf genau dieses Repo hat."
    );
  }
  if (!res.ok) throw new Error(`GitHub meldet einen Fehler (${res.status}).`);
  return true;
}

async function ghGetFile(filePath) {
  const repo = window.GITHUB_REPO;
  const branch = window.GITHUB_BRANCH || "main";
  const res = await ghFetch(`/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`);
  if (res.status === 404) return { text: null, sha: null };
  if (!res.ok) throw new Error(`Konnte ${filePath} nicht laden (${res.status}).`);
  const data = await res.json();
  return { text: base64ToUtf8(data.content), sha: data.sha };
}

async function ghPutFile(filePath, base64Content, sha, message) {
  const repo = window.GITHUB_REPO;
  const branch = window.GITHUB_BRANCH || "main";
  const body = { message, content: base64Content, branch };
  if (sha) body.sha = sha;

  const res = await ghFetch(`/repos/${repo}/contents/${filePath}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(`Konnte ${filePath} nicht speichern (${res.status}): ${errBody.message || res.statusText}`);
  }
  return res.json();
}

async function ghPutTextFile(filePath, text, sha, message) {
  return ghPutFile(filePath, utf8ToBase64(text), sha, message);
}

async function ghUploadImage(file, folder) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `assets/${folder}/${Date.now()}-${safeName}`;
  const buffer = await file.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);
  await ghPutFile(path, base64, null, `Bild hochgeladen: ${path}`);
  return path;
}
