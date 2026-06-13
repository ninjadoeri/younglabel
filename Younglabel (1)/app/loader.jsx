/* global React, Wordmark, Slot, Icon */
/* Loader variants:
   "atelier" — graphite pencil-sketch fashion model (drop-in illustration)
               doing a slow, continuous runway twirl over a cream backdrop,
               with a soft ground shadow and serif loading line. (default)
   "orbit" | "trails" | "type" — earlier abstract motion-trail variants. */
function Loader({ variant = "atelier", duration = 4800, onDone }) {
  const [done, setDone] = React.useState(false);
  const [shown, setShown] = React.useState(false);
  const videoRef = React.useRef(null);

  // Mute the element the instant it mounts. React does NOT reliably reflect the
  // `muted` attribute to the DOM property on first render, so autoplay can start
  // with sound. Setting the property directly here (and defaultMuted) is the
  // robust fix that actually silences the clip.
  const muteVideo = React.useCallback((v) => {
    videoRef.current = v;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.volume = 0;
  }, []);

  React.useEffect(() => {
    // gentle fade-in on first paint
    const f = requestAnimationFrame(() => setShown(true));
    // ensure the muted clip autoplays even when the tab/iframe isn't focused
    const v = videoRef.current;
    if (v) { v.muted = true; v.defaultMuted = true; v.volume = 0; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = reduce ? 1100 : duration;
    const t1 = setTimeout(() => setDone(true), d);
    const t2 = setTimeout(() => onDone && onDone(), d + 1100);
    return () => { cancelAnimationFrame(f); clearTimeout(t1); clearTimeout(t2); };
  }, [variant]);

  if (variant === "atelier") {
    return (
      <div className={"loader is-atelier" + (shown ? " shown" : "") + (done ? " done" : "")}>
        <div className="atelier-stage">
          <video
            ref={muteVideo}
            className="atelier-video"
            src="app/loader-model.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          ></video>
        </div>
        <div className="atelier-foot">
          <Wordmark size={20} />
          <p className="atelier-loading serif">Curating Your Collection<span className="dots"><i>.</i><i>.</i><i>.</i></span></p>
        </div>
      </div>
    );
  }

  const C = 200; // svg viewBox center
  const sparkles = [
    [70, 60, 5], [320, 90, 7], [120, 320, 6], [300, 300, 5],
    [200, 36, 8], [40, 200, 6], [360, 210, 7], [180, 360, 5],
  ];

  return (
    <div className={"loader" + (shown ? " shown" : "") + (done ? " done" : "")}>
      <div className="loader-stage">
        <svg viewBox="0 0 400 400">
          {variant === "orbit" && (
            <g fill="none">
              <g className="spin-ccw">
                <circle cx={C} cy={C} r="150" stroke="var(--line)" strokeWidth="1" />
                <circle cx={C} cy={C} r="150" stroke="var(--mocha)" strokeWidth="1.4"
                        strokeDasharray="40 900" strokeLinecap="round" />
              </g>
              <g className="spin-cw">
                <circle cx={C} cy={C} r="110" stroke="var(--line)" strokeWidth="1" opacity=".8" />
                <circle cx={C} cy={C} r="110" stroke="var(--ink)" strokeWidth="1.4"
                        strokeDasharray="26 660" strokeLinecap="round" />
                <circle cx={C} cy={C - 110} r="4.5" fill="var(--clay)" stroke="none" />
              </g>
              <g className="spin-fast">
                <circle cx={C} cy={C} r="66" stroke="var(--mocha)" strokeWidth="1" opacity=".55" />
                <circle cx={C} cy={C - 66} r="3" fill="var(--ink)" stroke="none" />
              </g>
            </g>
          )}

          {variant === "trails" && (
            <g fill="none" strokeLinecap="round">
              {[0, 1, 2, 3, 4].map((i) => (
                <path key={i}
                  d={`M ${C} ${C} m -130 0 a 130 130 0 1 1 ${260} 0`}
                  stroke={i % 2 ? "var(--mocha)" : "var(--ink)"}
                  strokeWidth={1.2 - i * 0.12}
                  opacity={0.7 - i * 0.12}
                  style={{ transformOrigin: "200px 200px",
                           animation: `sweep ${3 + i * 0.5}s ${i * 0.18}s cubic-bezier(.4,0,.3,1) infinite` }} />
              ))}
              <circle cx={C} cy={C} r="58" stroke="var(--line)" strokeWidth="1" className="spin-cw" />
            </g>
          )}

          {variant === "type" && (
            <g fill="none" stroke="var(--ink)" strokeLinecap="round">
              <path d="M120 130 L200 230" strokeWidth="1.6"
                    style={{ "--len": 130, strokeDasharray: 130, animation: "draw 1.1s .2s var(--ease) forwards", strokeDashoffset: 130 }} />
              <path d="M280 130 L200 230" strokeWidth="1.6"
                    style={{ "--len": 130, strokeDasharray: 130, animation: "draw 1.1s .35s var(--ease) forwards", strokeDashoffset: 130 }} />
              <path d="M200 230 L200 300" strokeWidth="1.6"
                    style={{ "--len": 70, strokeDasharray: 70, animation: "draw .8s .9s var(--ease) forwards", strokeDashoffset: 70 }} />
              <circle cx={C} cy={C} r="150" stroke="var(--line)" strokeWidth="1" className="spin-ccw" opacity=".6" />
            </g>
          )}

          {sparkles.map(([x, y, s], i) => (
            <g key={i} className="sparkle" style={{ animationDelay: `${(i % 4) * 0.5 + 0.4}s` }}>
              <path d={`M${x} ${y - s} L${x + s * 0.34} ${y - s * 0.34} L${x + s} ${y} L${x + s * 0.34} ${y + s * 0.34} L${x} ${y + s} L${x - s * 0.34} ${y + s * 0.34} L${x - s} ${y} L${x - s * 0.34} ${y - s * 0.34} Z`}
                    fill="var(--mocha)" stroke="none" />
            </g>
          ))}
        </svg>
      </div>

      <div className="loader-foot">
        <div className="loader-mark"><Wordmark size={22} /></div>
        <div className="loader-bar" style={{ "--dur": (duration - 400) + "ms" }}><i /></div>
      </div>
    </div>
  );
}

window.Loader = Loader;
