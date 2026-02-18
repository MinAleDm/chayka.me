(function () {
  const normalize = (path) => {
    if (!path || path === "/") return "index.html";
    const clean = path.endsWith("/") ? path.slice(0, -1) : path;
    const part = clean.split("/").pop();
    return part || "index.html";
  };

  const currentPage = normalize(window.location.pathname);
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const target = normalize(link.getAttribute("href"));
    if (target === currentPage) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const revealItems = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.17 }
  );

  revealItems.forEach((item) => observer.observe(item));
})();
