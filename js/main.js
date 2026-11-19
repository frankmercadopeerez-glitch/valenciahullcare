/* ============================================================
   SANTIAGO BUCEO PROFESIONAL — main.js
   Handles: navbar scroll, mobile menu, FAQ accordion,
            scroll-reveal, form submit → WhatsApp
   ============================================================ */

(function () {
  "use strict";

  /* ---- NAVBAR SCROLL ---- */
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- MOBILE MENU ---- */
  const toggle = document.querySelector(".nav__toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (toggle && mobileMenu) {
    const setMenuOpen = (open) => {
      mobileMenu.classList.toggle("open", open);
      mobileMenu.inert = !open;
      toggle.classList.toggle("active", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      document.body.classList.toggle("menu-open", open);
    };
    setMenuOpen(false);
    toggle.addEventListener("click", () => {
      const open = !mobileMenu.classList.contains("open");
      setMenuOpen(open);
      if (open) mobileMenu.querySelector("a")?.focus();
    });
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenuOpen(false));
    });
    document.addEventListener("keydown", (e) => {
      if (!mobileMenu.classList.contains("open")) return;
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggle.focus();
      } else if (e.key === "Tab") {
        const links = mobileMenu.querySelectorAll("a");
        if (!e.shiftKey && document.activeElement === links[links.length - 1]) {
          e.preventDefault();
          toggle.focus();
        } else if (e.shiftKey && document.activeElement === toggle) {
          e.preventDefault();
          links[links.length - 1]?.focus();
        }
      }
    });
    matchMedia("(min-width: 1025px)").addEventListener("change", (e) => {
      if (e.matches) setMenuOpen(false);
    });
  }

  /* ---- FAQ ACCORDION ---- */
  document.querySelectorAll(".faq-toggle").forEach((btn, index) => {
    const item = btn.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    answer.id ||= `faq-answer-${index + 1}`;
    btn.setAttribute("aria-controls", answer.id);
    btn.setAttribute("aria-expanded", String(item.classList.contains("open")));
    answer.inert = !item.classList.contains("open");
    btn.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");

      // Close all
      document.querySelectorAll(".faq-item.open").forEach((el) => {
        el.classList.remove("open");
        const panel = el.querySelector(".faq-answer");
        panel.classList.remove("open");
        panel.inert = true;
        el.querySelector(".faq-toggle").setAttribute("aria-expanded", "false");
      });

      // Toggle clicked
      if (!wasOpen) {
        item.classList.add("open");
        answer.classList.add("open");
        answer.inert = false;
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---- SCROLL REVEAL (IntersectionObserver) ---- */
  const revealEls = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right",
  );
  if (revealEls.length && "IntersectionObserver" in window &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -24px 0px" },
    );
    document.documentElement.classList.add("has-reveals");
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---- ACTIVE NAV LINK (highlight current page) ---- */
  const path = location.pathname === "/" ? "/index.html" : location.pathname;
  document.querySelectorAll(".nav__link, .mobile-menu a").forEach((a) => {
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.hash) return;
    if (url.pathname === path) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    } else if (path.startsWith("/blog/") && url.pathname === "/blog.html") {
      a.classList.add("active");
    }
  });

  /* ---- CONTACT FORM → WHATSAPP ---- */
  document.querySelectorAll(".contact-form").forEach((form) => {
    const lengthInput = form.elements.eslora;
    const unitInput = form.elements.unidad_eslora;
    const marinaInput = form.elements.ubicacion;
    const otherMarina = form.elements.otra_marina;
    const hullCleaning = form.querySelector('input[value="Limpieza de casco"]');
    const estimate = form.querySelector(".quote-estimate");
    const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

    const getLength = () => {
      const value = lengthInput.value.trim();
      if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return 0;
      return Number(value.replace(",", "."));
    };
    const updateEstimate = () => {
      const length = getLength();
      lengthInput.setCustomValidity(lengthInput.value && !length
        ? "Introduce una eslora mayor que cero, con hasta dos decimales."
        : "");
      estimate.hidden = !length || !hullCleaning.checked;
      if (!estimate.hidden) {
        const meters = length * (unitInput.value === "pies" ? 0.3048 : 1);
        estimate.textContent = `Limpieza de casco desde ${euros.format(meters * 18)}. Orientativo: confirmamos el precio según el estado del casco y el puerto.`;
      }
    };
    const updateMarina = () => {
      const isOther = marinaInput.value === "Otra marina";
      otherMarina.closest("[data-other-marina]").hidden = !isOther;
      otherMarina.required = isOther;
      otherMarina.disabled = !isOther;
    };
    lengthInput.addEventListener("input", updateEstimate);
    unitInput.addEventListener("change", updateEstimate);
    hullCleaning.addEventListener("change", updateEstimate);
    marinaInput.addEventListener("change", updateMarina);
    updateEstimate();
    updateMarina();
    form.hidden = false;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = form.querySelector('[name="nombre"]')?.value.trim() || "";
      const telefono =
        form.querySelector('[name="telefono"]')?.value.trim() || "";
      const eslora = form.querySelector('[name="eslora"]')?.value.trim() || "";
      const unidad =
        form.querySelector('[name="unidad_eslora"]')?.value || "pies";
      const ubicacion = otherMarina.disabled ? marinaInput.value : otherMarina.value.trim();
      const mensaje =
        form.querySelector('[name="mensaje"]')?.value.trim() || "";

      // Build checked services list
      const checks = [];
      form.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
        checks.push(cb.value);
      });

      if (!ubicacion) {
        otherMarina.value = "";
        otherMarina.reportValidity();
        return;
      }
      let text = "Hola Santiago, me gustaría pedir un presupuesto para mi embarcación.";
      if (nombre) text += `\n\nNombre: ${nombre}`;
      if (telefono) text += `\nTeléfono: ${telefono}`;
      if (eslora) text += `\nEslora: ${eslora} ${unidad}`;
      if (ubicacion) text += `\nUbicación: ${ubicacion}`;
      if (checks.length) text += `\nServicios de interés: ${checks.join(", ")}`;
      if (mensaje) text += `\n\n${mensaje}`;

      window.open(
        `https://wa.me/34611273268?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer",
      );
    });
  });

  /* ---- SUBSCRIPTION PLAN SELECTOR ---- */
  document.querySelectorAll(".sub-plan").forEach((plan) => {
    plan.addEventListener("click", () => {
      plan
        .closest(".subscription-plans")
        ?.querySelectorAll(".sub-plan")
        .forEach((p) => p.classList.remove("active"));
      plan.classList.add("active");
    });
  });

  /* ---- LANGUAGE SELECTOR ---- */
  const langBtn = document.getElementById("langBtn");
  const langDropdown = document.getElementById("langDropdown");
  const activeLangEl = document.getElementById("activeLang");

  if (langBtn && langDropdown) {
    const setLanguageOpen = (open) => {
      langDropdown.classList.toggle("open", open);
      langBtn.setAttribute("aria-expanded", String(open));
    };
    setLanguageOpen(false);
    // Detect current language from googtrans cookie
    const getGoogLang = () => {
      const match = document.cookie.match(/googtrans=\/es\/([a-z]{2})/i);
      return match ? match[1].toUpperCase() : "ES";
    };
    const cur = getGoogLang();
    if (activeLangEl) activeLangEl.textContent = cur;
    document.querySelectorAll(".lang-option").forEach((opt) => {
      if (opt.dataset.lang.toUpperCase() === cur) opt.classList.add("active");
    });

    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setLanguageOpen(!langDropdown.classList.contains("open"));
    });
    document.addEventListener("click", () =>
      setLanguageOpen(false),
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && langDropdown.classList.contains("open")) {
        setLanguageOpen(false);
        langBtn.focus();
      }
    });

    document.querySelectorAll(".lang-option").forEach((opt) => {
      opt.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = opt.dataset.lang;
        const host = location.hostname;
        if (lang === "es") {
          document.cookie =
            "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
          document.cookie =
            "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
            host;
        } else {
          document.cookie = "googtrans=/es/" + lang + "; path=/";
          document.cookie =
            "googtrans=/es/" + lang + "; path=/; domain=" + host;
        }
        location.reload();
      });
    });
  }
})();
