/* global React, Slot, Icon, Monogram */
const { money, CATEGORIES, PRODUCT_TAGS, TAG_VIEWS, productBadge } = window.DATA;

/* ---------- Product card ---------- */
function ProductCard({ p, onOpen, onAdd, idx = 0 }) {
  const badge = productBadge(p);
  const editable = window.__ylEditable;
  return (
    <article className="pcard reveal" style={{ transitionDelay: (idx % 4) * 0.07 + "s" }}>
      <div className="pcard-img" onClick={() => onOpen(p)}>
        <Slot id={"img-" + p.id} ratio="3 / 4" tag={p.name} />
        {badge && <span className={"pbadge is-" + badge.kind}>{badge.label}</span>}
        <button className="pquick" onClick={(e) => { e.stopPropagation(); onAdd(p); }}>
          <span>Add to bag</span><Icon name="plus" size={15} />
        </button>
        <button className="pheart" onClick={(e) => e.stopPropagation()} aria-label="Save"><Icon name="heart" size={17} /></button>
        {editable && (
          <button className="pedit" onClick={(e) => { e.stopPropagation(); window.__ylEdit && window.__ylEdit(p); }}>
            <Icon name="tag" size={13} /> Tags
          </button>
        )}
      </div>
      <div className="pcard-meta" onClick={() => onOpen(p)}>
        <div className="pcard-row">
          <h3>{p.name}</h3>
          <span className="pprice">{money(p.price)}</span>
        </div>
        <div className="pcard-cat">{p.cat}</div>
      </div>
    </article>
  );
}

/* ---------- Empty-state block (section has no products) ---------- */
function ComingSoon({ label }) {
  return (
    <div className="coming-soon">
      <Monogram size={26} style={{ color: "var(--line)" }} />
      <p><b>{label}</b> coming soon</p>
      <span>New pieces are landing shortly — check back soon.</span>
    </div>
  );
}

/* ---------- Collection / PLP ---------- */
function Collection({ products, view, filter, onOpen, onAdd, onNav }) {
  // active is either "All", a category name, or "view:<key>"
  const initial = view ? "view:" + view : (filter || "All");
  const [active, setActive] = React.useState(initial);
  const [sort, setSort] = React.useState("Featured");
  const gridRef = React.useRef(null);

  // re-sync if navigated in with a new target while already mounted
  React.useEffect(() => { setActive(view ? "view:" + view : (filter || "All")); }, [view, filter]);

  // category chips — only categories that actually contain products
  const catsPresent = CATEGORIES.filter((c) => products.some((p) => p.cat === c));

  const isView = active.startsWith("view:");
  const viewKey = isView ? active.slice(5) : null;
  let list = isView
    ? products.filter(TAG_VIEWS[viewKey].pred)
    : products.filter((p) => active === "All" || p.cat === active);

  if (sort === "Price · Low") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "Price · High") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "Newest") list = [...list].sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));

  const title = isView ? TAG_VIEWS[viewKey].label : (active === "All" ? "The Collection" : active);

  React.useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const raf = requestAnimationFrame(() => {
      root.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
    });
    return () => cancelAnimationFrame(raf);
  }, [active, sort, list.length]);

  return (
    <div className="page-plp">
      <div className="plp-head wrap">
        <button className="crumb" onClick={() => onNav("home")}>Home</button>
        <span className="crumb-sep">/</span>
        <span className="crumb cur">{title}</span>
        <h1 className="serif plp-title">{title}</h1>
        <p className="plp-sub">{list.length} {list.length === 1 ? "piece" : "pieces"} · crafted with intention, designed to last.</p>
      </div>

      <div className="plp-bar wrap">
        <div className="chips no-sb">
          {isView && <button className="chip on">{TAG_VIEWS[viewKey].label}</button>}
          <button className={"chip" + (!isView && active === "All" ? " on" : "")} onClick={() => setActive("All")}>All</button>
          {catsPresent.map((c) => (
            <button key={c} className={"chip" + (active === c ? " on" : "")} onClick={() => setActive(c)}>{c}</button>
          ))}
        </div>
        <div className="sort">
          <span className="kicker" style={{ fontSize: 10 }}>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {["Featured", "Newest", "Price · Low", "Price · High"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="wrap"><ComingSoon label={title} /></div>
      ) : (
        <div className="plp-grid wrap" ref={gridRef}>
          {list.map((p, i) => <ProductCard key={p.id} p={p} idx={i} onOpen={onOpen} onAdd={onAdd} />)}
        </div>
      )}
    </div>
  );
}

/* ---------- Product / PDP ---------- */
function Product({ products, p: p0, onOpen, onAdd, onNav }) {
  // always render the latest version of this product (admin edits reflect live)
  const p = products.find((x) => x.id === p0.id) || p0;
  const [color, setColor] = React.useState(0);
  const [size, setSize] = React.useState(null);
  const [thumb, setThumb] = React.useState(0);
  const [open, setOpen] = React.useState("details");
  const sizes = p.cat === "Accessories" ? ["OS"] : ["XS", "S", "M", "L", "XL"];
  const also = products.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  const badge = productBadge(p);
  const accord = [
    ["details", "Details & Fit", "Cut from responsibly-sourced fabric with a relaxed, true-to-size fit. Model is 5'9\" and wears a size S. Designed in-house, made in limited runs."],
    ["fabric", "Fabric & Care", "Premium midweight blend. Dry clean or cold gentle wash. Reshape while damp, lay flat to dry, cool iron if needed."],
    ["ship", "Shipping & Returns", "Complimentary express shipping over $150. Free 30-day returns. Carbon-neutral delivery on every order."],
  ];

  return (
    <div className="page-pdp">
      <div className="pdp-top wrap">
        <button className="crumb" onClick={() => onNav("home")}>Home</button>
        <span className="crumb-sep">/</span>
        <button className="crumb" onClick={() => onNav("collection", { filter: p.cat })}>{p.cat}</button>
        <span className="crumb-sep">/</span>
        <span className="crumb cur">{p.name}</span>
      </div>

      <div className="pdp-grid wrap">
        <div className="pdp-gallery">
          <Slot id={"pdp-" + p.id + "-" + thumb} ratio="4 / 5" tag={p.name + " · view " + (thumb + 1)} className="pdp-main" />
          <div className="pdp-thumbs">
            {[0, 1, 2, 3].map((t) => (
              <button key={t} className={"pdp-thumb" + (t === thumb ? " on" : "")} onClick={() => setThumb(t)}>
                <Slot id={"pdpt-" + p.id + "-" + t} ratio="1 / 1" />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info">
          {badge && <span className="kicker" style={{ color: "var(--clay)" }}>{badge.label}</span>}
          <h1 className="serif pdp-name">{p.name}</h1>
          <div className="pdp-rate">
            {[0,1,2,3,4].map(i => <Icon key={i} name="star" size={13} color="var(--mocha-2)" />)}
            <span>4.9 · 218 reviews</span>
          </div>
          <div className="pdp-price">{money(p.price)}</div>
          <p className="pdp-desc">Elevated essentials and modern silhouettes for the confident, the creative, and the effortlessly chic.</p>

          <div className="pdp-field">
            <span className="pdp-label">Colour — <b>{p.colors[color] || p.colors[0]}</b></span>
            <div className="swatches">
              {p.colors.map((c, i) => (
                <button key={c} className={"swatch" + (i === color ? " on" : "")} onClick={() => setColor(i)}
                        title={c} style={{ background: swatchColor(c) }} />
              ))}
            </div>
          </div>

          <div className="pdp-field">
            <span className="pdp-label">Size {size && <b>· {size}</b>}<a className="szguide">Size guide</a></span>
            <div className="sizes">
              {sizes.map((s) => (
                <button key={s} className={"sizebtn" + (s === size ? " on" : "")} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="pdp-actions">
            <button className="btn pdp-add" onClick={() => onAdd({ ...p, color: p.colors[color] || p.colors[0], size: size || "M" })}>
              Add to bag — {money(p.price)}
            </button>
            <button className="pdp-save" aria-label="Save"><Icon name="heart" size={20} /></button>
          </div>

          <div className="pdp-accord">
            {accord.map(([k, t, body]) => (
              <div key={k} className={"acc" + (open === k ? " open" : "")}>
                <button onClick={() => setOpen(open === k ? null : k)}>
                  <span>{t}</span><Icon name={open === k ? "minus" : "plus"} size={16} />
                </button>
                <div className="acc-body"><p>{body}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {also.length > 0 && (
        <section className="also wrap">
          <div className="sec-head"><h2 className="serif">You may also like</h2></div>
          <div className="plp-grid four">
            {also.map((x, i) => <ProductCard key={x.id} p={x} idx={i} onOpen={onOpen} onAdd={onAdd} />)}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- Product Editor (admin) ---------- */
function ProductEditor({ product, products, onClose, updateProduct }) {
  const open = !!product;
  // live view of the product being edited
  const p = product ? (products.find((x) => x.id === product.id) || product) : null;

  const sectionsFor = (pp) => {
    if (!pp) return [];
    const out = [];
    if (pp.isNewArrival) out.push("New Arrivals");
    if (pp.isBestSeller) out.push("Best Sellers");
    if (pp.isFeatured) out.push("Featured");
    if (pp.isOnSale) out.push("Sale");
    if (pp.cat) out.push(pp.cat);
    return out;
  };

  return (
    <>
      <div className={"scrim" + (open ? " on" : "")} onClick={onClose} />
      <div className={"peditor" + (open ? " open" : "")} role="dialog" aria-modal="true" aria-hidden={!open}>
        {p && (
          <>
            <div className="peditor-head">
              <span className="kicker">Product Editor</span>
              <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
            </div>

            <div className="peditor-body">
              <div className="peditor-prod">
                <div className="peditor-thumb"><Slot id={"img-" + p.id} ratio="3 / 4" /></div>
                <div className="peditor-prod-meta">
                  <h3 className="serif">{p.name}</h3>
                  <span className="peditor-price">{money(p.price)}</span>
                  <span className="peditor-id">ID · {p.id}</span>
                </div>
              </div>

              <div className="peditor-field">
                <label className="peditor-label">Category</label>
                <div className="peditor-select">
                  <select value={p.cat} onChange={(e) => updateProduct(p.id, { cat: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <Icon name="chevD" size={16} />
                </div>
              </div>

              <div className="peditor-field">
                <label className="peditor-label">Product Tags</label>
                <div className="peditor-tags">
                  {PRODUCT_TAGS.map((t) => (
                    <label key={t.key} className={"peditor-check" + (p[t.key] ? " on" : "")}>
                      <input type="checkbox" checked={!!p[t.key]}
                             onChange={(e) => updateProduct(p.id, { [t.key]: e.target.checked })} />
                      <span className="peditor-box"><Icon name="check" size={13} /></span>
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="peditor-field">
                <label className="peditor-label">Appears In</label>
                <div className="peditor-chips">
                  {sectionsFor(p).length
                    ? sectionsFor(p).map((s) => <span key={s} className="peditor-chip">{s}</span>)
                    : <span className="peditor-none">No sections — add a tag or category above.</span>}
                </div>
              </div>
            </div>

            <div className="peditor-foot">
              <span className="peditor-saved"><Icon name="check" size={13} /> Saved automatically</span>
              <button className="btn" onClick={onClose}>Done</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function swatchColor(name) {
  const m = {
    Sand:"#D8C7AC", Ivory:"#F0E9DC", Black:"#2B2722", Stone:"#C9BCA8", Cream:"#EDE4D3",
    Champagne:"#E3D3B6", Oat:"#DACBB2", Camel:"#C19A6B", White:"#F6F2EA", Sage:"#AFB3A0",
    Tan:"#B98F63", Nude:"#D9BFA3", Gold:"#C9A86A"
  };
  return m[name] || "#D8C7AC";
}

Object.assign(window, { ProductCard, Collection, Product, ProductEditor, ComingSoon });
