const menuButton = document.querySelector(".menu-btn");
const manualSiteUrl = (window.XUANJIAN_SITE_CONFIG?.manualSiteUrl || "http://localhost:3000")
  .replace(/\/+$/, "");

document.querySelectorAll("[data-manual-path]").forEach((link) => {
  link.href = `${manualSiteUrl}${link.dataset.manualPath || "/"}`;
});

const mobileNav = document.querySelector(".mobile-nav");
const sheetLinks = [...document.querySelectorAll("[data-sheet-link]")];
const sheetPanels = [...document.querySelectorAll("[data-sheet-panel]")];
const docLinks = [...document.querySelectorAll(".docs-sidebar a")];
const docSections = [...document.querySelectorAll(".doc-section")];
const downloadMenu = document.querySelector("[data-download-menu]");
const downloadMenuTrigger = downloadMenu?.querySelector(".download-menu-trigger");
const productNavTrigger = document.querySelector(".product-nav-trigger");
const headerContactMenu = document.querySelector(".header-contact-menu");
const headerContactTrigger = headerContactMenu?.querySelector(".header-contact-trigger");
const headerContactPopover = headerContactMenu?.querySelector(".header-contact-popover");
const heroDownloadMenu = document.querySelector("[data-hero-download-menu]");
const heroDownloadTrigger = heroDownloadMenu?.querySelector(".hero-download-trigger");
const productVideo = document.querySelector(".apple-product-video");
const siteHeader = document.querySelector(".apple-header");
const downloadVersionOptions = [...document.querySelectorAll("[data-download-platform]")];
const pageScroll = document.querySelector("[data-page-scroll]");
const pageScrollbar = document.querySelector("[data-page-scrollbar]");
const pageScrollbarThumb = document.querySelector("[data-page-scrollbar-thumb]");
const skillChips = [...document.querySelectorAll("[data-skill]")];
const skillMarqueeViewport = document.querySelector(".skills-marquee-viewport");
const skillDescription = document.querySelector(".skill-description");
const skillDescriptionName = document.querySelector("[data-skill-description-name]");
const skillDescriptionText = document.querySelector("[data-skill-description-text]");
const skillShowcase = document.querySelector("[data-skill-showcase]");
const expandableCards = [...document.querySelectorAll("[data-expandable-card]")];
const navigationEntry = window.performance?.getEntriesByType?.("navigation")?.[0];
const isPageReload =
  navigationEntry?.type === "reload" ||
  window.performance?.navigation?.type === window.performance?.navigation?.TYPE_RELOAD;
let scrollbarUpdateFrame = 0;
let thumbDragStartY = 0;
let thumbDragStartScrollTop = 0;
let thumbDragPointerId = null;
let mouseThumbDragging = false;
let activeSkillName = "";
let lastSkillCenterCheck = 0;
let pinnedSkillName = "";
let hoveredSkillName = "";
let skillInteractionPauseTimer = 0;
let headerContactCloseTimer = 0;

const skillDetails = [
  {
    name: "实时监控",
    description: "多路视频画面实时查看，支持 1/4/6/8/9/12 画面切换与画面轮巡，出入口状态一目了然。",
  },
  {
    name: "视频巡查",
    description: "按时间段查询历史视频并回放，支持画面轮巡与抓拍原图留存，方便事后追溯。",
  },
  {
    name: "闸道管控",
    description: "对出入口闸机进行远程开闸、关闸与状态监测，支持快捷切换与批量控制。",
  },
  {
    name: "车辆管理",
    description: "统一管理月卡、季卡、年卡、白名单、访客等全部登记车辆，支持按停车场筛选。",
  },
  {
    name: "预约管理",
    description: "支持连续多天、多时段预约，访客到场自动放行，预约记录清晰可查。",
  },
  {
    name: "白名单管理",
    description: "维护长期车辆与内部员工白名单，支持批量移除与到期时间管理。",
  },
  {
    name: "黑名单管理",
    description: "将异常车辆加入黑名单并设置到期时间，支持批量操作与原因记录。",
  },
  {
    name: "车位地图",
    description: "可视化查看车位占用情况，支持固定车位分配与车位利用率统计。",
  },
  {
    name: "停车场管理",
    description: "一个物业多个停车场统一维护，车位数、出入口、负责人集中管理。",
  },
  {
    name: "收费规则",
    description: "配置临时车按时计费与月卡、季卡、年卡收费规则，金额支持直接编辑。",
  },
  {
    name: "收入统计",
    description: "营收趋势、收入构成、各停车场收入与支付方式占比可视化展示。",
  },
  {
    name: "车流分析",
    description: "按时间段分析入场、出场车流与峰值时段，辅助运营决策。",
  },
  {
    name: "异常统计",
    description: "车牌识别失败、人工开闸等异常事件统计与闭环率跟踪。",
  },
  {
    name: "历史视频回放",
    description: "按年月日时分秒精确查询历史视频，按时间段列表播放对应片段。",
  },
];

const reducedSkillMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const renderRollingSkillText = (element, text, delayOffset = 0) => {
  const animatedText = document.createElement("span");
  animatedText.className = "skill-description-rolling";
  animatedText.setAttribute("aria-hidden", "true");
  element.setAttribute("aria-label", text);
  element.textContent = "";

  [...text].forEach((character, index) => {
    const visibleCharacter = character === " " ? "\u00a0" : character;
    const characterSlot = document.createElement("span");
    const characterFace = document.createElement("span");

    characterSlot.className = "skill-description-char";
    characterSlot.dataset.char = visibleCharacter;
    characterSlot.style.setProperty(
      "--skill-description-char-delay",
      `${delayOffset + Math.min(index * 18, 270)}ms`,
    );
    characterFace.textContent = visibleCharacter;
    characterSlot.append(characterFace);
    animatedText.append(characterSlot);
  });

  element.append(animatedText);
};

const renderSkillDescription = (skill, animate = true) => {
  skillDescription.classList.remove("is-rolling");
  renderRollingSkillText(skillDescriptionName, skill.name);
  renderRollingSkillText(skillDescriptionText, skill.description, 70);

  if (animate && !reducedSkillMotion.matches) {
    requestAnimationFrame(() => {
      skillDescription.classList.add("is-rolling");
    });
  }
};

const openHeaderContactMenu = () => {
  window.clearTimeout(headerContactCloseTimer);
  headerContactMenu?.classList.add("open");
  headerContactTrigger?.setAttribute("aria-expanded", "true");
};

const closeHeaderContactMenu = () => {
  window.clearTimeout(headerContactCloseTimer);
  headerContactMenu?.classList.remove("open");
  headerContactTrigger?.setAttribute("aria-expanded", "false");
};

const scheduleHeaderContactMenuClose = () => {
  window.clearTimeout(headerContactCloseTimer);
  headerContactCloseTimer = window.setTimeout(closeHeaderContactMenu, 220);
};

headerContactMenu?.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") {
    openHeaderContactMenu();
  }
});

headerContactMenu?.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") {
    scheduleHeaderContactMenuClose();
  }
});

headerContactPopover?.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") {
    openHeaderContactMenu();
  }
});

headerContactPopover?.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") {
    scheduleHeaderContactMenuClose();
  }
});

headerContactMenu?.addEventListener("focusin", openHeaderContactMenu);

headerContactMenu?.addEventListener("focusout", (event) => {
  if (!headerContactMenu.contains(event.relatedTarget)) {
    scheduleHeaderContactMenuClose();
  }
});

const detectDownloadPlatform = () => {
  const userAgent = navigator.userAgent || "";
  if (/Android|iPhone|iPad|iPod/i.test(userAgent)) return "";

  const platform =
    navigator.userAgentData?.platform ||
    navigator.platform ||
    userAgent;

  if (/Mac/i.test(platform)) return "macos";
  if (/Win/i.test(platform)) return "windows";
  return "";
};

const currentDownloadPlatform = detectDownloadPlatform();

downloadVersionOptions.forEach((option) => {
  const isCurrentDevice = option.dataset.downloadPlatform === currentDownloadPlatform;
  option.classList.toggle("is-current-device", isCurrentDevice);

  if (isCurrentDevice) {
    option.setAttribute("aria-current", "true");
  } else {
    option.removeAttribute("aria-current");
  }
});

const setActiveSkill = (skillName, options = {}) => {
  if (!skillDescription || !skillDescriptionName || !skillDescriptionText) return;

  const nextIndex = skillDetails.findIndex(({ name }) => name === skillName);
  if (nextIndex === -1) return;

  const nextSkill = skillDetails[nextIndex];
  if (activeSkillName === nextSkill.name && !options.force) return;
  activeSkillName = nextSkill.name;
  skillChips.forEach((chip) => {
    const isActive = chip.dataset.skill === nextSkill.name;
    chip.classList.toggle("active", isActive);
    chip.setAttribute("aria-pressed", String(isActive));
    if (isActive) {
      chip.setAttribute("aria-current", "true");
    } else {
      chip.removeAttribute("aria-current");
    }
  });

  renderSkillDescription(
    nextSkill,
    !options.immediate && !reducedSkillMotion.matches,
  );
};

const updateCenteredSkill = (timestamp = 0) => {
  if (!skillMarqueeViewport || !skillChips.length) return;

  if (!document.hidden && timestamp - lastSkillCenterCheck >= 90) {
    lastSkillCenterCheck = timestamp;
    const viewportRect = skillMarqueeViewport.getBoundingClientRect();
    const viewportCenter = viewportRect.left + viewportRect.width / 2;
    let centeredChip = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    skillChips.forEach((chip) => {
      const chipRect = chip.getBoundingClientRect();
      const chipCenter = chipRect.left + chipRect.width / 2;
      const distance = Math.abs(chipCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        centeredChip = chip;
      }
    });

    if (centeredChip && !pinnedSkillName && !hoveredSkillName) {
      setActiveSkill(centeredChip.dataset.skill, {
        immediate: !activeSkillName,
      });
    }
  }

  requestAnimationFrame(updateCenteredSkill);
};

skillChips.forEach((chip) => {
  const showHoveredSkill = (event) => {
    if (event.type === "pointerenter" && event.pointerType === "touch") return;
    hoveredSkillName = chip.dataset.skill;
    setActiveSkill(hoveredSkillName, {
      force: true,
      revealImmediately: true,
    });
  };

  const releaseHoveredSkill = () => {
    if (hoveredSkillName !== chip.dataset.skill) return;
    hoveredSkillName = "";
    if (pinnedSkillName) {
      setActiveSkill(pinnedSkillName, { force: true });
    }
  };

  chip.addEventListener("pointerenter", showHoveredSkill);
  chip.addEventListener("pointerleave", releaseHoveredSkill);
  chip.addEventListener("focus", showHoveredSkill);
  chip.addEventListener("blur", releaseHoveredSkill);

  chip.addEventListener("click", (event) => {
    pinnedSkillName = chip.dataset.skill;
    setActiveSkill(chip.dataset.skill, { force: true });
    skillShowcase?.classList.add("is-interaction-paused");
    window.clearTimeout(skillInteractionPauseTimer);
    skillInteractionPauseTimer = window.setTimeout(() => {
      skillShowcase?.classList.remove("is-interaction-paused");
    }, 5000);

    if (event.detail > 0) {
      chip.blur();
    }
  });
});

if (skillDetails.length && skillMarqueeViewport) {
  requestAnimationFrame(updateCenteredSkill);
}

const setCardExpanded = (card, expanded) => {
  const toggle = card.querySelector(".card-expand-toggle");
  const detailId = toggle?.getAttribute("aria-controls");
  const detail = detailId ? document.getElementById(detailId) : null;
  const group = card.dataset.expandGroup;

  if (expanded && group) {
    expandableCards
      .filter((candidate) => candidate !== card && candidate.dataset.expandGroup === group)
      .forEach((candidate) => setCardExpanded(candidate, false));
  }

  card.classList.toggle("is-expanded", expanded);
  toggle?.setAttribute("aria-expanded", String(expanded));
  if (detail) {
    detail.setAttribute("aria-hidden", String(!expanded));
  }

  const cardName =
    card.querySelector(".workflow-step, .audience-label")?.textContent?.trim() ||
    "卡片";
  toggle?.setAttribute(
    "aria-label",
    `${expanded ? "收起" : "展开"}${cardName}详细说明`,
  );
};

expandableCards.forEach((card) => {
  const toggle = card.querySelector(".card-expand-toggle");
  toggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    setCardExpanded(card, !expanded);
  });

  card.addEventListener("click", (event) => {
    if (event.target.closest("button, a")) return;
    const expanded = toggle?.getAttribute("aria-expanded") === "true";
    setCardExpanded(card, !expanded);
  });
});

const updatePageScrollbar = () => {
  if (!pageScroll || !pageScrollbar || !pageScrollbarThumb) return;

  const scrollRect = pageScroll.getBoundingClientRect();
  const maxScrollTop = Math.max(0, pageScroll.scrollHeight - pageScroll.clientHeight);
  const trackHeight = pageScroll.clientHeight;
  const visibleRatio = pageScroll.scrollHeight
    ? pageScroll.clientHeight / pageScroll.scrollHeight
    : 1;
  const thumbHeight = Math.max(42, Math.round(trackHeight * Math.min(1, visibleRatio)));
  const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
  const thumbTop = maxScrollTop
    ? Math.round((pageScroll.scrollTop / maxScrollTop) * maxThumbTop)
    : 0;

  pageScrollbar.hidden = maxScrollTop === 0;
  pageScrollbar.style.top = `${Math.round(scrollRect.top)}px`;
  pageScrollbar.style.height = `${trackHeight}px`;
  pageScrollbar.dataset.maxScrollTop = String(maxScrollTop);
  pageScrollbar.dataset.maxThumbTop = String(maxThumbTop);
  pageScrollbarThumb.style.height = `${thumbHeight}px`;
  pageScrollbarThumb.style.transform = `translateY(${thumbTop}px)`;
};

const updateHeaderSurface = () => {
  siteHeader?.classList.toggle("is-scrolled", (pageScroll?.scrollTop || 0) > 12);
};

const queuePageScrollbarUpdate = () => {
  if (scrollbarUpdateFrame) return;
  scrollbarUpdateFrame = requestAnimationFrame(() => {
    scrollbarUpdateFrame = 0;
    updatePageScrollbar();
    updateHeaderSurface();
  });
};

const stopThumbDrag = (event) => {
  if (!pageScrollbarThumb) return;
  if (
    event?.pointerId !== undefined &&
    thumbDragPointerId !== null &&
    event.pointerId !== thumbDragPointerId
  ) {
    return;
  }

  if (
    thumbDragPointerId !== null &&
    pageScrollbarThumb.hasPointerCapture?.(thumbDragPointerId)
  ) {
    pageScrollbarThumb.releasePointerCapture(thumbDragPointerId);
  }
  thumbDragPointerId = null;
  mouseThumbDragging = false;
  pageScrollbarThumb.classList.remove("dragging");
};

const applyThumbDragPosition = (clientY) => {
  if (!pageScroll || !pageScrollbar) return;
  const maxScrollTop = Number(pageScrollbar.dataset.maxScrollTop || 0);
  const maxThumbTop = Number(pageScrollbar.dataset.maxThumbTop || 0);
  if (!maxScrollTop || !maxThumbTop) return;

  const scrollDelta = ((clientY - thumbDragStartY) / maxThumbTop) * maxScrollTop;
  pageScroll.scrollTop = thumbDragStartScrollTop + scrollDelta;
};

pageScroll?.addEventListener("scroll", queuePageScrollbarUpdate, { passive: true });
window.addEventListener("resize", queuePageScrollbarUpdate);
window.addEventListener("load", queuePageScrollbarUpdate, { once: true });
window.addEventListener("pageshow", queuePageScrollbarUpdate);

pageScrollbarThumb?.addEventListener("pointerdown", (event) => {
  if (!pageScroll || event.button !== 0) return;
  thumbDragPointerId = event.pointerId;
  thumbDragStartY = event.clientY;
  thumbDragStartScrollTop = pageScroll.scrollTop;
  pageScrollbarThumb.setPointerCapture?.(event.pointerId);
  pageScrollbarThumb.classList.add("dragging");
  event.preventDefault();
});

pageScrollbarThumb?.addEventListener("mousedown", (event) => {
  if (!pageScroll || event.button !== 0) return;
  mouseThumbDragging = true;
  thumbDragStartY = event.clientY;
  thumbDragStartScrollTop = pageScroll.scrollTop;
  pageScrollbarThumb.classList.add("dragging");
  event.preventDefault();
});

const moveThumbDrag = (event) => {
  if (event.pointerId !== thumbDragPointerId) return;
  applyThumbDragPosition(event.clientY);
  event.preventDefault();
};

const moveMouseThumbDrag = (event) => {
  if (!mouseThumbDragging) return;
  applyThumbDragPosition(event.clientY);
  event.preventDefault();
};

window.addEventListener("pointermove", moveThumbDrag);
window.addEventListener("mousemove", moveMouseThumbDrag);
window.addEventListener("pointerup", stopThumbDrag);
window.addEventListener("pointercancel", stopThumbDrag);
window.addEventListener("mouseup", stopThumbDrag);
window.addEventListener("blur", () => stopThumbDrag());

if ("ResizeObserver" in window && pageScroll) {
  const pageScrollbarObserver = new ResizeObserver(queuePageScrollbarUpdate);
  [...pageScroll.children].forEach((child) => pageScrollbarObserver.observe(child));
}

queuePageScrollbarUpdate();

const isDefaultProductEntry = () =>
  !new URLSearchParams(window.location.search).has("sheet") &&
  (!window.location.hash || isPageReload);

const resetDefaultEntryViewport = () => {
  if (!isDefaultProductEntry()) return;
  pageScroll?.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

const queueDefaultEntryViewportReset = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(resetDefaultEntryViewport);
  });
};

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

resetDefaultEntryViewport();
window.addEventListener(
  "pageshow",
  queueDefaultEntryViewportReset,
  { once: true },
);
window.addEventListener(
  "load",
  queueDefaultEntryViewportReset,
  { once: true },
);

const closeDownloadMenu = () => {
  downloadMenu?.classList.remove("open");
  downloadMenuTrigger?.setAttribute("aria-expanded", "false");
};

const closeHeroDownloadMenu = () => {
  heroDownloadMenu?.classList.remove("open");
  heroDownloadTrigger?.setAttribute("aria-expanded", "false");
};

const setActiveSheet = (sheetName, hash = "", options = {}) => {
  if (!sheetPanels.length) return;

  const availableSheets = sheetPanels.map((panel) => panel.dataset.sheetPanel);
  const nextSheet = availableSheets.includes(sheetName) ? sheetName : "product";
  const scrollBehavior = options.scrollBehavior || "smooth";

  sheetPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.sheetPanel === nextSheet);
  });

  sheetLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.sheetLink === nextSheet);
  });

  const isProductSheet = nextSheet === "product";
  productNavTrigger?.classList.toggle("selected", isProductSheet);
  if (isProductSheet) {
    productNavTrigger?.setAttribute("aria-current", "page");
  } else {
    productNavTrigger?.removeAttribute("aria-current");
  }

  const nextUrl = new URL(window.location.href);
  if (nextSheet === "product") {
    nextUrl.searchParams.delete("sheet");
  } else {
    nextUrl.searchParams.set("sheet", nextSheet);
  }
  nextUrl.hash = hash;
  if (options.updateHistory !== false) {
    window.history.pushState({ sheet: nextSheet }, "", nextUrl);
  } else {
    window.history.replaceState({ sheet: nextSheet }, "", nextUrl);
  }

  if (nextSheet === "product" && hash) {
    requestAnimationFrame(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: scrollBehavior, block: "start" });
    });
  } else {
    pageScroll?.scrollTo({ top: 0, behavior: scrollBehavior });
  }
  queuePageScrollbarUpdate();
};

menuButton?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  closeDownloadMenu();
});

downloadMenuTrigger?.addEventListener("click", () => {
  downloadMenu.classList.add("open");
  downloadMenuTrigger.setAttribute("aria-expanded", "true");
  closeHeroDownloadMenu();
  mobileNav?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
});

downloadMenu?.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") {
    downloadMenu.classList.add("open");
    downloadMenuTrigger?.setAttribute("aria-expanded", "true");
  }
});

downloadMenu?.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") {
    closeDownloadMenu();
  }
});

downloadMenu?.addEventListener("focusin", () => {
  downloadMenu.classList.add("open");
  downloadMenuTrigger?.setAttribute("aria-expanded", "true");
});

downloadMenu?.addEventListener("focusout", (event) => {
  if (!downloadMenu.contains(event.relatedTarget)) {
    closeDownloadMenu();
  }
});

downloadMenu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeDownloadMenu();
  }
});

heroDownloadTrigger?.addEventListener("click", () => {
  heroDownloadMenu.classList.add("open");
  heroDownloadTrigger.setAttribute("aria-expanded", "true");
  closeDownloadMenu();
});

heroDownloadMenu?.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") {
    heroDownloadMenu.classList.add("open");
    heroDownloadTrigger?.setAttribute("aria-expanded", "true");
  }
});

heroDownloadMenu?.addEventListener("pointerleave", (event) => {
  if (event.pointerType === "mouse") {
    closeHeroDownloadMenu();
  }
});

heroDownloadMenu?.addEventListener("focusin", () => {
  heroDownloadMenu.classList.add("open");
  heroDownloadTrigger?.setAttribute("aria-expanded", "true");
});

heroDownloadMenu?.addEventListener("focusout", (event) => {
  if (!heroDownloadMenu.contains(event.relatedTarget)) {
    closeHeroDownloadMenu();
  }
});

heroDownloadMenu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeHeroDownloadMenu();
  }
});

mobileNav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    mobileNav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

sheetLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!sheetPanels.length) return;

    const sheetName = link.dataset.sheetLink;
    const linkUrl = new URL(link.href, window.location.href);

    if (linkUrl.origin !== window.location.origin || linkUrl.pathname !== window.location.pathname) return;

    event.preventDefault();
    setActiveSheet(sheetName, linkUrl.hash);
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-download-menu]")) {
    closeDownloadMenu();
  }

  if (!event.target.closest("[data-hero-download-menu]")) {
    closeHeroDownloadMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  closeDownloadMenu();
  closeHeroDownloadMenu();
  closeHeaderContactMenu();
});

if (docLinks.length && docSections.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      docLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visibleEntry.target.id}`);
      });
    },
    {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0.1, 0.4, 0.7],
    },
  );

  docSections.forEach((section) => observer.observe(section));
}

if (sheetPanels.length) {
  const initialSheet = new URLSearchParams(window.location.search).get("sheet") || "product";
  const initialHash = initialSheet === "product" && !isPageReload ? window.location.hash : "";
  setActiveSheet(initialSheet, initialHash, {
    updateHistory: false,
    scrollBehavior: "auto",
  });
}

window.addEventListener("popstate", () => {
  if (!sheetPanels.length) return;

  const sheetName = new URLSearchParams(window.location.search).get("sheet") || "product";
  const hash = sheetName === "product" ? window.location.hash : "";
  setActiveSheet(sheetName, hash, { updateHistory: false });
});

if (productVideo) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  productVideo.muted = true;
  productVideo.defaultMuted = true;

  const playProductVideo = () => {
    if (reducedMotion.matches || document.hidden) return;
    productVideo.play().catch(() => {});
  };

  const pauseProductVideo = () => {
    productVideo.pause();
  };

  if (reducedMotion.matches) {
    pauseProductVideo();
  } else {
    playProductVideo();

    const videoObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playProductVideo();
        } else {
          pauseProductVideo();
        }
      },
      { threshold: 0.2 },
    );

    videoObserver.observe(productVideo);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseProductVideo();
    } else {
      playProductVideo();
    }
  });
}
