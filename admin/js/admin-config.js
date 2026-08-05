/**
 * ADMIN-KONFIGURATION
 * -----------------------------------------------------------
 * Trag hier dein GitHub-Repo und den Passwort-Hash für den
 * Admin-Bereich ein. Anleitung: siehe ADMIN-SETUP.md im Hauptordner.
 *
 *  GITHUB_REPO    "dein-github-username/dein-repo-name"
 *  GITHUB_BRANCH   Branch, in den committet wird (meist "main")
 *  ADMIN_PASSWORD_HASH
 *                  SHA-256-Hash deines Admin-Passworts (NICHT das
 *                  Passwort selbst!). Wie du den Hash erzeugst, steht
 *                  in ADMIN-SETUP.md.
 *
 * Wichtig: Hier steht absichtlich NUR ein Passwort-Hash, kein Token.
 * Deinen GitHub-Zugriffstoken gibst du bei jedem Login direkt im
 * Admin-Bereich ein — der landet nie in dieser Datei und nie im Repo.
 */
window.GITHUB_REPO = "JustinPriem/justin-priem.de";
window.GITHUB_BRANCH = "main";
window.ADMIN_PASSWORD_HASH = "02cab2b95c4fbcfc95b07dac3e1b783b1edce590379777c758a0812ff0dea69d";
