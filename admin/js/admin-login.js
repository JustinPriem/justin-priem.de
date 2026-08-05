function showLoginError(msg) {
  document.getElementById("login-error").textContent = msg;
}

function prefillRememberedToken() {
  const remembered = localStorage.getItem("gh_admin_token");
  if (remembered) {
    document.getElementById("login-token").value = remembered;
    document.getElementById("login-remember").checked = true;
  }
}

async function init() {
  if (!window.ADMIN_PASSWORD_HASH || window.ADMIN_PASSWORD_HASH.includes("PASTE-DEINEN")) {
    showLoginError(
      "Admin-Bereich ist noch nicht eingerichtet (admin/js/admin-config.js). Siehe ADMIN-SETUP.md."
    );
    document.getElementById("login-submit").disabled = true;
    return;
  }

  prefillRememberedToken();

  // Schon eingeloggt in dieser Sitzung? Direkt weiter.
  if (sessionStorage.getItem("gh_admin_authed") === "1" && getGithubToken()) {
    window.location.href = "dashboard.html";
    return;
  }

  const form = document.getElementById("login-form");
  const submitBtn = document.getElementById("login-submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoginError("");
    submitBtn.disabled = true;
    submitBtn.textContent = "Prüfe …";

    const password = document.getElementById("login-password").value;
    const token = document.getElementById("login-token").value.trim();
    const remember = document.getElementById("login-remember").checked;

    try {
      const hash = await sha256Hex(password);
      if (hash.toLowerCase() !== window.ADMIN_PASSWORD_HASH.toLowerCase()) {
        throw new Error("Passwort ist falsch.");
      }

      // Token testweise setzen, damit ghCheckAccess() ihn verwenden kann.
      sessionStorage.setItem("gh_admin_token", token);
      await ghCheckAccess();

      if (remember) {
        localStorage.setItem("gh_admin_token", token);
      } else {
        localStorage.removeItem("gh_admin_token");
      }
      sessionStorage.setItem("gh_admin_authed", "1");

      window.location.href = "dashboard.html";
    } catch (err) {
      sessionStorage.removeItem("gh_admin_token");
      sessionStorage.removeItem("gh_admin_authed");
      showLoginError(err.message || String(err));
      submitBtn.disabled = false;
      submitBtn.textContent = "Anmelden";
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
