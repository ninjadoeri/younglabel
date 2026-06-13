/* global React, ReactDOM, Loader, Home, Collection, Product, ProductEditor, Monogram, Wordmark, Icon, Slot */
const { money } = window.DATA;
const NAV_LINKS = ["New In", "Clothing", "Dresses", "Sets", "Accessories", "Sale"];
// Map nav labels to a tag-view or category filter so every entry point opens
// the correctly-filtered product listing.
const NAV_MAP = {
  "New In": { view: "new" }, "Clothing": { filter: "Clothing" }, "Dresses": { filter: "Dresses" },
  "Sets": { filter: "Co-ord Sets" }, "Accessories": { filter: "Accessories" }, "Sale": { view: "sale" },
};
const FOOT_MAP = {
  "New In": { view: "new" }, "Best Sellers": { view: "best" }, "Dresses": { filter: "Dresses" },
  "Co-ord Sets": { filter: "Co-ord Sets" }, "Accessories": { filter: "Accessories" }, "Sale": { view: "sale" },
};

function App() {
  const params = new URLSearchParams(location.search);
  const startVariant = params.get("loader") || "atelier";
  const skip = params.get("skip") === "1";
  const still = params.get("still") === "1";

  const [booted, setBooted] = React.useState(skip);
  const [loaderVariant] = React.useState(startVariant);
  const [page, setPage] = React.useState("home");
  const [pParams, setPParams] = React.useState({});
  const [cart, setCart] = React.useState([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [flash, setFlash] = React.useState(false);
  const [products, setProducts] = React.useState(() => window.DATA.loadProducts());
  const [editProduct, setEditProduct] = React.useState(null);
  const scrollerRef = React.useRef(null);
  const editable = !!(window.omelette && window.omelette.writeFile);

  // Single source of truth for product metadata. Editing one product updates
  // state (so every section re-derives instantly) and persists the override.
  const updateProduct = React.useCallback((id, patch) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    window.DATA.saveProductOverride(id, patch);
  }, []);

  // Expose the editor opener + edit-mode flag for ProductCard (avoids deep
  // prop drilling through every section).
  React.useEffect(() => {
    window.__ylEditable = editable;
    window.__ylEdit = (p) => setEditProduct(p);
    return () => { window.__ylEdit = null; };
  }, [editable]);

  // nav background state
  React.useEffect(() => {
    const el = scrollerRef.current;
    const onScroll = () => setScrolled((el ? el.scrollTop : window.scrollY) > 50);
    const t = el || window;
    t.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => t.removeEventListener("scroll", onScroll);
  }, [booted, page]);

  // reveal observer (re-bind per page)
  React.useEffect(() => {
    if (!booted) return;
    const els = document.querySelectorAll(".reveal:not(.in)");
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [booted, page, pParams]);

  const toTop = () => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: 0 }); else window.scrollTo({ top: 0 });
  };

  const onNav = (p, params2 = {}) => { setPage(p); setPParams(params2); setMenuOpen(false); setCartOpen(false); requestAnimationFrame(toTop); };
  const onOpen = (product) => { setPage("product"); setPParams({ product }); setMenuOpen(false); requestAnimationFrame(toTop); };

  const onAdd = (product) => {
    setCart((c) => {
      const key = product.id + (product.size || "") + (product.color || "");
      const ex = c.find((x) => x._k === key);
      if (ex) return c.map((x) => x._k === key ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { ...product, _k: key, qty: 1, size: product.size || "M", color: product.color || product.colors[0] }];
    });
    setFlash(true);
    setTimeout(() => setFlash(false), 1400);
    setCartOpen(true);
  };
  const setQty = (k, d) => setCart((c) => c.map((x) => x._k === k ? { ...x, qty: Math.max(1, x.qty + d) } : x));
  const removeItem = (k) => setCart((c) => c.filter((x) => x._k !== k));

  const count = cart.reduce((s, x) => s + x.qty, 0);
  const subtotal = cart.reduce((s, x) => s + x.qty * x.price, 0);
  const solid = scrolled || page !== "home" || menuOpen;

  return (
    <div className={"app" + (still ? " still" : "")}>
      {!skip && <Loader variant={loaderVariant} onDone={() => setBooted(true)} />}

      <div className={"shell" + (booted ? " booted" : "")} ref={scrollerRef}>
        <Nav links={NAV_LINKS} solid={solid} count={count} flash={flash}
             onNav={onNav} onMenu={() => setMenuOpen(true)} onCart={() => setCartOpen(true)} />

        <main>
          {page === "home" && <Home products={products} onNav={onNav} onOpen={onOpen} onAdd={onAdd} />}
          {page === "collection" && <Collection products={products} view={pParams.view} filter={pParams.filter} onOpen={onOpen} onAdd={onAdd} onNav={onNav} />}
          {page === "product" && pParams.product && <Product products={products} p={pParams.product} onOpen={onOpen} onAdd={onAdd} onNav={onNav} />}
        </main>

        <Footer onNav={onNav} />
      </div>

      <MobileMenu open={menuOpen} links={NAV_LINKS} onClose={() => setMenuOpen(false)} onNav={onNav} />
      <CartDrawer open={cartOpen} cart={cart} subtotal={subtotal} onClose={() => setCartOpen(false)}
                  setQty={setQty} remove={removeItem} onNav={onNav} />
      <ProductEditor product={editProduct} products={products}
                     onClose={() => setEditProduct(null)} updateProduct={updateProduct} />
    </div>
  );
}

/* ---------- NAV ---------- */
function Nav({ links, solid, count, flash, onNav, onMenu, onCart }) {
  return (
    <header className={"nav" + (solid ? " solid" : "")}>
      <div className="nav-in">
        <div className="nav-l">
          <button className="icon-btn nav-burger" onClick={onMenu} aria-label="Menu"><Icon name="menu" size={24} /></button>
          <button className="nav-brand" onClick={() => onNav("home")}>
            <span className="wordmark" style={{ fontSize: 17 }}>YOUNGLABEL</span>
          </button>
        </div>
        <nav className="nav-c">
          {links.map((l) => (
            <button key={l} className="nav-link" onClick={() => onNav("collection", NAV_MAP[l] || {})}>{l}</button>
          ))}
        </nav>
        <div className="nav-r">
          <button className="icon-btn nav-search" aria-label="Search"><Icon name="search" size={21} /></button>
          <button className="icon-btn nav-user" aria-label="Account"><Icon name="user" size={21} /></button>
          <button className={"icon-btn nav-bag" + (flash ? " flash" : "")} onClick={onCart} aria-label="Bag">
            <Icon name="bag" size={21} />
            {count > 0 && <span className="bag-count">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- MOBILE MENU ---------- */
function MobileMenu({ open, links, onClose, onNav }) {
  return (
    <div className={"mmenu" + (open ? " open" : "")}>
      <div className="mmenu-bar">
        <Wordmark size={16} tag={false} />
        <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={24} /></button>
      </div>
      <nav className="mmenu-links">
        {links.map((l, i) => (
          <button key={l} className="mmenu-link" style={{ transitionDelay: open ? i * 0.05 + 0.1 + "s" : "0s" }}
                  onClick={() => onNav("collection", NAV_MAP[l] || {})}>
            <span className="serif">{l}</span><Icon name="arrR" size={30} />
          </button>
        ))}
      </nav>
      <div className="mmenu-foot">
        <Monogram size={28} style={{ color: "var(--ink)" }} />
        <span className="kicker">Defined by Youth</span>
      </div>
    </div>
  );
}

/* ---------- CART DRAWER ---------- */
function CartDrawer({ open, cart, subtotal, onClose, setQty, remove, onNav }) {
  const free = 150;
  const pct = Math.min(100, (subtotal / free) * 100);
  return (
    <>
      <div className={"scrim" + (open ? " on" : "")} onClick={onClose} />
      <aside className={"cart" + (open ? " open" : "")} aria-hidden={!open}>
        <div className="cart-head">
          <span className="kicker">Your Bag ({cart.reduce((s, x) => s + x.qty, 0)})</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={22} /></button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <Monogram size={30} style={{ color: "var(--line)" }} />
            <p>Your bag is empty.</p>
            <button className="btn" onClick={() => { onClose(); onNav("collection"); }}>Start Shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-ship">
              {subtotal >= free
                ? <span>You've unlocked <b>free express shipping</b> ✦</span>
                : <span>You're {money(free - subtotal)} from <b>free shipping</b></span>}
              <div className="cart-prog"><i style={{ width: pct + "%" }} /></div>
            </div>
            <div className="cart-items no-sb">
              {cart.map((x) => (
                <div className="cart-item" key={x._k}>
                  <Slot id={"img-" + x.id} ratio="3 / 4" className="cart-thumb" />
                  <div className="cart-item-meta">
                    <div className="cart-item-top">
                      <h4>{x.name}</h4>
                      <button className="cart-x" onClick={() => remove(x._k)} aria-label="Remove"><Icon name="close" size={15} /></button>
                    </div>
                    <span className="cart-opt">{x.color} · {x.size}</span>
                    <div className="cart-item-bot">
                      <div className="qty">
                        <button onClick={() => setQty(x._k, -1)} aria-label="Less"><Icon name="minus" size={14} /></button>
                        <span>{x.qty}</span>
                        <button onClick={() => setQty(x._k, 1)} aria-label="More"><Icon name="plus" size={14} /></button>
                      </div>
                      <span className="cart-price">{money(x.price * x.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-foot">
              <div className="cart-sub"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <p className="cart-note">Shipping & taxes calculated at checkout.</p>
              <button className="btn cart-checkout">Checkout — {money(subtotal)}</button>
              <button className="cart-cont" onClick={onClose}>Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

/* ---------- FOOTER ---------- */
function Footer({ onNav }) {
  const cols = [
    ["Shop", ["New In", "Best Sellers", "Dresses", "Co-ord Sets", "Accessories", "Sale"]],
    ["Help", ["Contact", "Shipping", "Returns", "Size Guide", "Track Order", "FAQ"]],
    ["About", ["Our Story", "Sustainability", "Careers", "Press", "Stores", "Journal"]],
  ];
  return (
    <footer className="foot">
      <div className="foot-top wrap">
        <div className="foot-brand">
          <Monogram size={34} style={{ color: "var(--surface)" }} />
          <Wordmark size={20} color="var(--surface)" />
          <p>Elevated essentials for the confident, the creative, and the effortlessly chic.</p>
          <div className="foot-social">
            <a className="icon-btn" aria-label="Instagram"><Icon name="instagram" size={20} /></a>
          </div>
        </div>
        <div className="foot-cols">
          {cols.map(([h, items]) => (
            <div key={h} className="foot-col">
              <span className="foot-col-h">{h}</span>
              {items.map((it) => <button key={it} onClick={() => onNav("collection", FOOT_MAP[it] || {})}>{it}</button>)}
            </div>
          ))}
        </div>
      </div>
      <div className="foot-mark"><span className="wordmark">YOUNGLABEL</span></div>
      <div className="foot-bottom wrap">
        <span>© 2026 YOUNGLABEL. All rights reserved.</span>
        <div className="foot-legal">
          <a>Privacy</a><a>Terms</a><a>Cookies</a>
        </div>
      </div>
    </footer>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
