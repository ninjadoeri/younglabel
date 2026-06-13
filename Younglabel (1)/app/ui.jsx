/* global React */
const { useState, useEffect, useRef, useCallback } = React;

/* ---------- The geometric YL monogram ---------- */
function Monogram({ size = 34, stroke = 1.1, style }) {
  return (
    <svg className="yl-mark" width={size} height={size * 1.18}
         viewBox="0 0 40 47" fill="none" style={style} aria-hidden="true">
      <path d="M7 6 L20 23" strokeWidth={stroke} />
      <path d="M33 6 L20 23" strokeWidth={stroke} />
      <line x1="20" y1="23" x2="20" y2="41" strokeWidth={stroke} />
      <line x1="20" y1="41" x2="30.5" y2="41" strokeWidth={stroke} />
      <line x1="14" y1="12.5" x2="26" y2="12.5" strokeWidth={stroke * 0.8} opacity="0.5" />
    </svg>
  );
}

/* ---------- Wordmark ---------- */
function Wordmark({ size = 18, tag = true, gap = 7, color }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap, color }}>
      <span className="wordmark" style={{ fontSize: size, lineHeight: 1 }}>YOUNGLABEL</span>
      {tag && (
        <span className="wordmark" style={{ fontSize: size * 0.42, letterSpacing: ".34em", color: "var(--muted)" }}>
          Defined by Youth
        </span>
      )}
    </span>
  );
}

/* ---------- Icons (thin stroke) ---------- */
const I = {
  menu: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 8h16M4 14h11" stroke="currentColor" strokeWidth="1.2"/></svg>,
  search: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="11" r="6.2" stroke="currentColor" strokeWidth="1.2"/><path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.2"/></svg>,
  user: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="8.4" r="3.6" stroke="currentColor" strokeWidth="1.2"/><path d="M5 20c.7-4 3.6-6 7-6s6.3 2 7 6" stroke="currentColor" strokeWidth="1.2"/></svg>,
  bag: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6.5 8h11l1 12.5H5.5L6.5 8z" stroke="currentColor" strokeWidth="1.2"/><path d="M9 8.5V7a3 3 0 016 0v1.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.2"/></svg>,
  arrR: (p) => <svg viewBox="0 0 30 12" fill="none" {...p}><path d="M0 6h28M23 1l5 5-5 5" stroke="currentColor" strokeWidth="1.1"/></svg>,
  chevL: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.2"/></svg>,
  chevR: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.2"/></svg>,
  chevD: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 9l7 7 7-7" stroke="currentColor" strokeWidth="1.2"/></svg>,
  play: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M9 7.5l8 4.5-8 4.5V7.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="1.2"/></svg>,
  minus: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 12h12" stroke="currentColor" strokeWidth="1.2"/></svg>,
  heart: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0112 8a3.7 3.7 0 017 2.7C19 15.6 12 20 12 20z" stroke="currentColor" strokeWidth="1.2"/></svg>,
  star: (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 3l2.5 5.6 6.1.6-4.6 4 1.4 6L12 16.8 6.6 19.2 8 13.2 3.4 9.2l6.1-.6L12 3z"/></svg>,
  instagram: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.2"/><circle cx="16.6" cy="7.4" r="1" fill="currentColor"/></svg>,
  tag: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 12.6V5a1 1 0 011-1h7.6a1 1 0 01.7.3l6.4 6.4a1 1 0 010 1.4l-7.6 7.6a1 1 0 01-1.4 0L4.3 13.3a1 1 0 01-.3-.7z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8.4" cy="8.4" r="1.3" fill="currentColor"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  image: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="4" y="5" width="16" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="9" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.2"/><path d="M5 17l4.5-4.5L13 16l3-3 3 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  move: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};
function Icon({ name, size = 22, color, style, ...rest }) {
  const C = I[name];
  return C ? C({ width: size, height: size, style: { color, display: "block", ...style }, ...rest }) : null;
}

/* Persistent "intentionally removed" set. The image-slot's built-in Remove only
   clears the user drop and then *reveals the src= fallback again* — so a wired
   SLOT_SRC photo reappears instantly and Remove looks broken. We record removed
   slot ids here and suppress the SLOT_SRC fallback for them, so removal sticks
   across reloads. Replacing/dropping a new image un-removes the slot. */
const REMOVED_KEY = "younglabel:removed-slots";
function readRemoved() {
  try { return new Set(JSON.parse(localStorage.getItem(REMOVED_KEY) || "[]")); }
  catch { return new Set(); }
}
function setRemoved(id, val) {
  if (!id) return;
  const s = readRemoved();
  if (val) s.add(id); else s.delete(id);
  try { localStorage.setItem(REMOVED_KEY, JSON.stringify([...s])); } catch {}
}

/* ---------- Image slot (luxury placeholder, user-fillable) ---------- */
function Slot({ id, tag, shape = "rect", radius = 0, ratio, style, className = "", src, controls = false }) {
  const [, force] = React.useReducer((n) => n + 1, 0);
  // Images now live as real files in app/photos/ (see app/photos.js). Fall back
  // to the registry by id so each slot fetches its file on launch — unless the
  // user has explicitly removed this slot. An explicit src prop or a user drop
  // (sidecar) still overrides the registry.
  if (!src && window.SLOT_SRC && window.SLOT_SRC[id] && !readRemoved().has(id)) {
    src = window.SLOT_SRC[id];
  }
  const wrapStyle = { ...style };
  if (ratio) wrapStyle.aspectRatio = ratio;
  const slotRef = React.useRef(null);
  // Edit mode is gated on the same bridge the image-slot uses internally.
  const editable = !!(window.omelette && window.omelette.writeFile);

  // The Remove/Replace controls live inside the component's shadow DOM (and the
  // React control bar proxies to them). Their clicks bubble out to the host, so
  // one capture-phase listener on the host catches BOTH the built-in hover
  // controls and the proxied React bar: Remove makes the removal persistent and
  // drops the src= fallback; Replace re-enables it.
  React.useEffect(() => {
    const el = slotRef.current;
    if (!el || !id) return;
    const onClick = (e) => {
      const path = e.composedPath ? e.composedPath() : [];
      const act = path.find((n) => n && n.getAttribute && n.getAttribute("data-act"));
      const which = act && act.getAttribute("data-act");
      if (which === "clear") { setRemoved(id, true); force(); }
      else if (which === "replace") { setRemoved(id, false); }
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [id]);

  // Proxy to the slot's own shadow-DOM controls so persistence/file-handling
  // is fully reused. Used where the built-in top-right controls get clipped by
  // a shaped container (e.g. the hero arch).
  const act = (which) => {
    const el = slotRef.current;
    if (!el) return;
    if (which === "align") {
      // Enter the component's reframe mode: drag to reposition, scroll/handles
      // to zoom, Esc or click-outside to commit. Only meaningful once filled.
      if (el.hasAttribute("data-filled") && typeof el._enterReframe === "function") el._enterReframe();
      else act("replace"); // nothing to align yet → fall back to adding an image
      return;
    }
    if (!el.shadowRoot) return;
    const btn = el.shadowRoot.querySelector('[data-act="' + which + '"]');
    if (btn) btn.click();
    else if (which === "replace") {
      const inp = el.shadowRoot.querySelector('input[type="file"]');
      if (inp) inp.click();
    }
  };

  return (
    <div className={"slot-wrap " + className} style={wrapStyle}>
      <image-slot
        ref={slotRef}
        id={id}
        shape={shape}
        radius={String(radius)}
        placeholder=""
        src={src || undefined}
        style={{ width: "100%", height: "100%", display: "block" }}
      ></image-slot>
      {tag && <span className="slot-tag">{tag}</span>}
      {controls && editable && (
        <div className="slot-ctl" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => act("replace")}><Icon name="image" size={13} /> Replace</button>
          <button type="button" onClick={() => act("align")} title="Drag to reposition, scroll to zoom"><Icon name="move" size={13} /> Align</button>
          <button type="button" onClick={() => act("clear")}><Icon name="close" size={13} /> Remove</button>
        </div>
      )}
    </div>
  );
}

/* ---------- Marquee tape ---------- */
function Marquee({ items, sep = "✦" }) {
  const line = items.flatMap((t, i) => [t, sep]);
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", borderBlock: "1px solid var(--line)", padding: "13px 0" }}>
      <div className="ml-track" style={{ display: "inline-block", whiteSpace: "nowrap" }}>
        {[0, 1].map((k) => (
          <span key={k} style={{ display: "inline-block" }}>
            {line.map((t, i) => (
              <span key={i} className={t === sep ? "" : "kicker"}
                    style={{ margin: "0 22px", color: t === sep ? "var(--mocha)" : undefined, fontSize: t === sep ? 11 : undefined }}>
                {t}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Monogram, Wordmark, Icon, Slot, Marquee, useState, useEffect, useRef, useCallback });
