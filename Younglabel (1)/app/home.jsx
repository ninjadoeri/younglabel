/* global React, Slot, Icon, Monogram, Wordmark, Marquee, ProductCard, ComingSoon */
const { COLLECTIONS, STYLES, REVIEWS, HERO_SLIDES, TAG_VIEWS } = window.DATA;

function Home({ products, onNav, onOpen, onAdd }) {
  return (
    <div className="page-home">
      <Hero onNav={onNav} />
      <Marquee items={["Complimentary Express Shipping", "New Arrivals Weekly", "Crafted in Limited Runs", "Carbon-Neutral Delivery"]} />
      <Collections products={products} onNav={onNav} />
      <StylePicker onNav={onNav} />
      <BestSellers products={products} onNav={onNav} onOpen={onOpen} onAdd={onAdd} />
      <CoordFeature onNav={onNav} />
      <NewArrivals products={products} onNav={onNav} onOpen={onOpen} onAdd={onAdd} />
      <Editorial />
      <InstaFeed />
      <Reviews />
      <Newsletter />
    </div>
  );
}

/* ---------- HERO ---------- */
function Hero({ onNav }) {
  const [i, setI] = React.useState(0);
  const n = HERO_SLIDES.length;
  const go = (d) => setI((p) => (p + d + n) % n);
  React.useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % n), 6500);
    return () => clearInterval(t);
  }, []);
  const s = HERO_SLIDES[i];

  return (
    <section className="hero">
      <span className="hero-tab">New In</span>

      <div className="hero-left">
        <div className="hero-copy" key={"c" + i}>
          <h1 className="serif hero-h">
            {s.h.map((l, k) => <span key={k} className="hero-line">{l}</span>)}
          </h1>
          <p className="hero-body">Elevated essentials and modern silhouettes designed for the confident, the creative, and the effortlessly chic.</p>
          <button className="btn-ghost" onClick={() => onNav("collection")}>Shop Collection</button>
        </div>
      </div>

      <div className="hero-center">
        <div className="hero-arch">
          <Slot id="hero-model" tag="hero — full-length model" controls={true} />
        </div>
      </div>

      <aside className="hero-side">
        <div className="hero-side-top" key={"s" + i}>
          <div className="hero-side-kick">
            <span className="kicker">{s.kicker}</span>
            <span className="rule" style={{ width: 44, marginTop: 12, background: "var(--ink)" }} />
          </div>
          <h2 className="serif hero-side-h">
            {s.side.map((l, k) => <span key={k}>{l}<br/></span>)}
          </h2>
          <p className="hero-side-body">Explore our latest pieces, crafted with intention and designed to inspire.</p>
        </div>

        <button className="hero-film" onClick={() => onNav("collection", { view: "featured" })}>
          <Slot id="hero-film" tag="campaign film" />
          <span className="film-play"><Icon name="play" size={22} color="#fff" /></span>
          <span className="film-label">Watch Film</span>
        </button>

        <div className="hero-nav">
          <span className="kicker" style={{ fontSize: 10 }}>Scroll to discover</span>
          <span className="rule" style={{ background: "var(--ink)", opacity: .35 }} />
          <div className="hero-nav-row">
            <span className="hero-count"><b>{String(i + 1).padStart(2, "0")}</b> / {String(n).padStart(2, "0")}</span>
            <div className="hero-arrows">
              <button onClick={() => go(-1)} aria-label="Previous"><Icon name="chevL" size={18} /></button>
              <button onClick={() => go(1)} aria-label="Next"><Icon name="chevR" size={18} /></button>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}

/* ---------- COLLECTIONS (auto-counts + wired nav) ---------- */
function Collections({ products, onNav }) {
  const countFor = (nav) =>
    nav.view ? products.filter(TAG_VIEWS[nav.view].pred).length
             : products.filter((p) => p.cat === nav.filter).length;
  return (
    <section className="collections wrap">
      <div className="sec-head">
        <span className="kicker">Shop by Collection</span>
        <h2 className="serif">Find your edit.</h2>
      </div>
      <div className="col-grid">
        {COLLECTIONS.map((c, i) => {
          const count = countFor(c.nav);
          return (
            <button key={c.key} className="col-tile reveal" style={{ transitionDelay: i * 0.08 + "s" }}
                    onClick={() => onNav("collection", c.nav)}>
              <Slot id={c.slot} ratio="3 / 4" tag={c.title} />
              <div className="col-tile-body">
                <h3 className="serif">{c.title}</h3>
                <span className="col-sub">{count} {count === 1 ? "piece" : "pieces"} · {c.sub}</span>
                <span className="link-u">Shop Now <Icon name="arrR" size={26} /></span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- CHOOSE YOUR STYLE ---------- */
function StylePicker({ onNav }) {
  return (
    <section className="styles">
      <div className="styles-head">
        <Monogram size={26} style={{ color: "var(--ink)" }} />
        <h2 className="serif">Choose Your Style</h2>
        <p className="styles-sub">However you move through the day, there's an edit made for it.</p>
      </div>
      <div className="styles-grid wrap">
        {STYLES.map((s, i) => (
          <button key={s.name} className="style-row reveal" style={{ transitionDelay: (i % 3) * 0.07 + "s" }}
                  onClick={() => onNav("collection")}>
            <Slot id={s.slot} ratio="1 / 1" className="style-thumb" />
            <div className="style-meta">
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
              <span className="arr"><Icon name="arrR" size={30} /></span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- BEST SELLERS RAIL (auto from isBestSeller) ---------- */
function BestSellers({ products, onNav, onOpen, onAdd }) {
  const list = products.filter((p) => p.isBestSeller);
  return (
    <section className="rail-sec">
      <div className="sec-head wrap rail-head">
        <div>
          <span className="kicker">Most Wanted</span>
          <h2 className="serif">Best Sellers</h2>
        </div>
        {list.length > 0 && (
          <button className="link-u" onClick={() => onNav("collection", { view: "best" })}>View all <Icon name="arrR" size={26} /></button>
        )}
      </div>
      {list.length === 0 ? (
        <div className="wrap"><ComingSoon label="Best Sellers" /></div>
      ) : (
        <div className="rail no-sb">
          {list.map((p, i) => (
            <div className="rail-item" key={p.id}><ProductCard p={p} idx={i} onOpen={onOpen} onAdd={onAdd} /></div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- CO-ORD FEATURE ---------- */
function CoordFeature({ onNav }) {
  return (
    <section className="coord">
      <div className="coord-media">
        <Slot id="coord-feature" tag="co-ord set — editorial" />
      </div>
      <div className="coord-copy reveal">
        <span className="kicker">Co-ord Sets</span>
        <h2 className="serif">One decision.<br/>Fully styled.</h2>
        <p>Matched separates designed to wear together or apart. Throw on a set and walk out the door looking considered — no styling required.</p>
        <button className="btn" onClick={() => onNav("collection", { filter: "Co-ord Sets" })}>Shop Sets <Icon name="arrR" size={28} className="arr" /></button>
      </div>
    </section>
  );
}

/* ---------- NEW ARRIVALS GRID (auto from isNewArrival) ---------- */
function NewArrivals({ products, onNav, onOpen, onAdd }) {
  const list = products.filter((p) => p.isNewArrival).slice(0, 8);
  return (
    <section className="arrivals wrap">
      <div className="sec-head rail-head">
        <div>
          <span className="kicker">Fresh In</span>
          <h2 className="serif">New Arrivals</h2>
        </div>
        {list.length > 0 && (
          <button className="link-u" onClick={() => onNav("collection", { view: "new" })}>Shop all new <Icon name="arrR" size={26} /></button>
        )}
      </div>
      {list.length === 0 ? (
        <ComingSoon label="New Arrivals" />
      ) : (
        <div className="plp-grid four">
          {list.map((p, i) => <ProductCard key={p.id} p={p} idx={i} onOpen={onOpen} onAdd={onAdd} />)}
        </div>
      )}
    </section>
  );
}

/* ---------- EDITORIAL QUOTE ---------- */
function Editorial() {
  return (
    <section className="editorial">
      <div className="edit-media"><Slot id="edit-bg" tag="campaign — wide editorial" /></div>
      <div className="edit-inner">
        <Monogram size={30} style={{ color: "var(--surface)" }} />
        <p className="serif edit-quote">"We don't chase trends. We make the pieces you'll reach for in five years, and still feel like yourself in."</p>
        <span className="kicker" style={{ color: "rgba(255,255,255,.7)" }}>— The YOUNGLABEL Studio</span>
      </div>
    </section>
  );
}

/* ---------- INSTAGRAM FEED ---------- */
function InstaFeed() {
  return (
    <section className="insta wrap">
      <div className="insta-head">
        <Icon name="instagram" size={22} />
        <h2 className="serif">@younglabel</h2>
        <span className="insta-sub">Tag us to be featured · styled by you</span>
      </div>
      <div className="insta-grid">
        {["ig1","ig2","ig3","ig4","ig5","ig6"].map((id, i) => (
          <div key={id} className="insta-cell reveal" style={{ transitionDelay: (i % 6) * 0.05 + "s" }}>
            <Slot id={id} ratio="1 / 1" />
            <span className="insta-ic"><Icon name="instagram" size={20} color="#fff" /></span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- REVIEWS ---------- */
function Reviews() {
  const [i, setI] = React.useState(0);
  const r = REVIEWS[i];
  return (
    <section className="reviews">
      <span className="kicker">Worn & Loved</span>
      <div className="rev-stars">{[0,1,2,3,4].map(k => <Icon key={k} name="star" size={15} color="var(--mocha-2)" />)}</div>
      <blockquote className="serif rev-q" key={i}>{r.q}</blockquote>
      <div className="rev-by">{r.name} · <span>{r.item}</span></div>
      <div className="rev-dots">
        {REVIEWS.map((_, k) => (
          <button key={k} className={"rev-dot" + (k === i ? " on" : "")} onClick={() => setI(k)} aria-label={"Review " + (k+1)} />
        ))}
      </div>
    </section>
  );
}

/* ---------- NEWSLETTER ---------- */
function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState("idle"); // idle | error | ok
  const submit = (e) => {
    e.preventDefault();
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
    setState(ok ? "ok" : "error");
  };
  return (
    <section className="news">
      <div className="news-inner reveal">
        <Monogram size={28} style={{ color: "var(--ink)" }} />
        <span className="kicker">The List</span>
        <h2 className="serif">First looks, private sales,<br/>and the occasional love letter.</h2>
        {state === "ok" ? (
          <p className="news-ok">Welcome to YOUNGLABEL. Check your inbox for 10% off your first order.</p>
        ) : (
          <form className="news-form" onSubmit={submit} noValidate>
            <input type="email" placeholder="Email address" value={email}
                   onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
                   className={state === "error" ? "err" : ""} />
            <button className="btn" type="submit">Subscribe</button>
          </form>
        )}
        {state === "error" && <span className="news-err">Please enter a valid email address.</span>}
        <p className="news-fine">By subscribing you agree to our privacy policy. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

window.Home = Home;
