function setupDemoNavigation() {
  if (document.body.dataset.demoNavReady === "true") return;
  document.body.dataset.demoNavReady = "true";
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (nav) {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    nav.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (!href.endsWith(".html")) return;
      const targetPath = href.split("/").pop();
      const isCurrent = targetPath === currentPath;
      link.toggleAttribute("aria-current", isCurrent);
    });
  }

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupDemoReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  items.forEach((item) => observer.observe(item));
}

function setupMediaTabs() {
  const groups = document.querySelectorAll("[data-media-tabs]");
  if (!groups.length) return;

  groups.forEach((group) => {
    const buttons = group.querySelectorAll("[data-media-tab]");
    const panels = group.querySelectorAll("[data-media-panel]");

    const activate = (id) => {
      buttons.forEach((button) => {
        const isActive = button.dataset.mediaTab === id;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.mediaPanel !== id;
      });
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activate(button.dataset.mediaTab || "");
      });
    });

    const firstId = buttons[0]?.dataset.mediaTab || panels[0]?.dataset.mediaPanel;
    if (firstId) activate(firstId);
  });
}

function showDemoToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3000);
}

setupDemoNavigation();
setupDemoReveal();
setupMediaTabs();
