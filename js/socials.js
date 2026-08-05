/**
 * ZENTRALE SOCIAL-LINKS
 * -----------------------------------------------------------
 * Trag hier deine echten Profil-Links ein. Diese Datei wird auf
 * JEDER Seite eingebunden, du musst die Links also nur EINMAL
 * pflegen.
 *
 * icon: eines der Schlüssel-Wörter unten in ICONS
 * Wenn eine Plattform fehlt, einfach eine neue Zeile ergänzen.
 */
const SOCIALS = [
  { name: "Instagram", url: "https://instagram.com/justinpriem/", icon: "instagram" },
  { name: "Facebook", url: "https://facebook.com/justin.priem.9/", icon: "facebook" },
  { name: "YouTube", url: "https://youtube.com/@justinpriem1", icon: "youtube" },
  { name: "SoundCloud", url: "https://soundcloud.com/justinpriem", icon: "soundcloud" },
  { name: "Steam", url: "https://steamcommunity.com/id/JustinPriem/", icon: "steam" },
  { name: "Discord", url: "https://discord.com/users/367925987578478594", icon: "discord" },
  { name: "Strava", url: "https://www.strava.com/athletes/128212099", icon: "strava" },
  { name: "Komoot", url: "https://www.komoot.com/de-de/user/758104319088", icon: "komoot" },
];

const ICONS = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1"/></svg>',
  discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.3 5.9A16.6 16.6 0 0 0 15.1 4.6l-.2.4a12.9 12.9 0 0 1 3.6 1.4 14.6 14.6 0 0 0-12.9 0 12.9 12.9 0 0 1 3.7-1.4l-.2-.4A16.6 16.6 0 0 0 4.9 5.9C2.7 9.2 2 12.4 2.3 15.6a16.7 16.7 0 0 0 5.1 2.6l.7-1.1a10.8 10.8 0 0 1-1.7-.8l.4-.3a12 12 0 0 0 10.4 0l.4.3a10.8 10.8 0 0 1-1.7.8l.7 1.1a16.6 16.6 0 0 0 5.1-2.6c.4-3.7-.5-6.9-2.4-9.7ZM9.2 13.8c-.8 0-1.5-.8-1.5-1.7s.6-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Zm5.6 0c-.8 0-1.5-.8-1.5-1.7s.6-1.7 1.5-1.7 1.5.8 1.5 1.7-.6 1.7-1.5 1.7Z"/></svg>',
  twitch: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 3 3 6.5v13h5V22l3.5-2.5H15L21 14V3H4Zm15 10-3 3h-4l-2.5 2.5V16H6V5h13v8Z"/><rect x="9" y="7.5" width="1.7" height="4.5"/><rect x="13.3" y="7.5" width="1.7" height="4.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h4.2l4 5.6L16.8 3H20l-6.2 7.9L20.5 21h-4.2l-4.4-6.1L6.8 21H3.5l6.7-8.5L4 3Z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.4 2.2 1.8 3.6 4 3.9v2.7c-1.4 0-2.7-.4-3.9-1.2v6.4a5.6 5.6 0 1 1-4.8-5.5v2.8a2.8 2.8 0 1 0 2 2.7V3h2.7Z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2.5" y="5.5" width="19" height="13" rx="3.5"/><path fill="var(--footer-bg,#000)" d="M10.5 9.3v5.4l4.8-2.7-4.8-2.7Z"/></svg>',
  steam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9.5"/><circle cx="8.4" cy="15.3" r="1.9" fill="currentColor" stroke="none"/><circle cx="8.4" cy="15.3" r="3.3"/><circle cx="15" cy="9.2" r="2.7"/><circle cx="15" cy="9.2" r="1" fill="currentColor" stroke="none"/><path d="M9.9 13.5 12.6 11.3"/></svg>',
  strava: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.2 2 4 14.4h3.9l2.3-4.5 2.3 4.5H16L10.2 2Z"/><path d="m14 14.4-1.7 3.4-1.7-3.4H8l3.9 7.6h.8l3.9-7.6H14Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 22v-8h2.7l.4-3.2H14V8.6c0-.9.3-1.6 1.6-1.6h1.7V4.1C17 4 15.9 3.9 14.7 3.9c-2.6 0-4.4 1.6-4.4 4.5v2.4H7.6v3.2h2.7v8H14Z"/></svg>',
  soundcloud: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 12.5v4h1.2v-4h-1.2Zm2-1.5v5.5h1.2V11h-1.2Zm2-.8v6.3h1.2v-6.3h-1.2Zm2 .3v6h1.2v-6h-1.2Zm2.2-3.5v9.5h1.1V6.8c-.4.1-.8.4-1.1.7Zm2-.9c-.3 0-.6 0-.9.1v10.3h7.8c1.7 0 3.1-1.3 3.1-3s-1.4-3-3.1-3c-.3 0-.6 0-.9.1a4.6 4.6 0 0 0-6-4.5Z"/></svg>',
  komoot: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 12l8 10 8-10-8-10Zm0 4.2 5 5.8-5 6.8-5-6.8 5-5.8Z"/></svg>',
};

function renderFooter() {
  const mount = document.getElementById("site-footer");
  if (!mount) return;
  const links = SOCIALS.map(
    (s) => `
    <a class="social-link" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}">
      ${ICONS[s.icon] || ""}
      <span>${s.name}</span>
    </a>`
  ).join("");

  mount.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="footer-name">Justin Priem</span>
        <span class="footer-tag">justin-priem.de</span>
      </div>
      <nav class="social-row" aria-label="Social Media Links">${links}</nav>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", renderFooter);
