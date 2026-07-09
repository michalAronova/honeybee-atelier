import { useEffect, useState } from "react";
import { layerTone, onTone, layerIcon, layerType } from "../lib/cutaway";
import LayerIcon from "./LayerIcon";

export type Cake = {
  id: string;
  name: string;
  price: string;
  image: string;
  occasion?: string;
  servings?: number;
  tagline?: string;
  description?: string;
  inStock: boolean;
  layers: string[];
};

function CutawayOverlay({ cake, onClose }: { cake: Cake; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="cutaway-overlay"
      role="dialog"
      aria-modal="false"
      aria-label={`Layers inside ${cake.name}`}
      onClick={onClose}
      title="Click to close"
    >
      {/* clicking the scrim closes; clicking the panel does not */}
      <div className="cutaway-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cutaway-overlay__head">
          <span className="kicker" style={{ margin: 0 }}>Inside {cake.name}</span>
          <button className="cutaway-close" onClick={onClose} aria-label="Close layers">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <ol className="layer-list">
          {cake.layers.map((l, i) => {
            const tone = layerTone(l);
            return (
              <li className="layer-row" key={i}>
                <span className="layer-swatch" style={{ background: tone, color: onTone(tone) }}>
                  <LayerIcon kind={layerIcon(l)} />
                </span>
                <span className="layer-name">{l}</span>
                <span className="layer-type">{layerType(l)}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function Card({ cake }: { cake: Cake }) {
  const [open, setOpen] = useState(false);
  const hasLayers = cake.layers?.length > 0;
  const href = `/cakes/${cake.slug}`;
  return (
    <article className={"cake-card" + (open ? " is-open" : "")}>
      <div className="cake-card__media ratio-4x5">
        <a href={href} className="cake-card__imglink" aria-label={`View ${cake.name}`}>
          {cake.image ? (
            <img className="img-cover" src={cake.image} alt={`${cake.name} — ${cake.description ?? "handcrafted cake"}`} loading="lazy" width={480} height={600} />
          ) : (
            <div className="ph"><svg className="ph__mark" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16 M6 20v-5c0-2 2.7-3 6-3s6 1 6 3v5 M8 12V8c0-1.7 1.8-2.5 4-2.5S16 6.3 16 8v4 M12 5.5V3" /></svg><span className="ph__label">{cake.name}</span></div>
          )}
        </a>
        {cake.occasion && <span className="pill cake-card__pill">{cake.occasion}</span>}
        {hasLayers && !open && (
          <button className="reveal-btn" onClick={() => setOpen(true)} aria-expanded={open} aria-controls={`cut-${cake.id}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h16 M4 12h16 M4 16h16" /></svg>
            Reveal the layers
          </button>
        )}
        {open && <div id={`cut-${cake.id}`}><CutawayOverlay cake={cake} onClose={() => setOpen(false)} /></div>}
      </div>

      <div className="cake-card__body">
        <div className="cake-card__head">
          <h3><a href={href}>{cake.name}</a></h3>
          <span className="price">${cake.price}</span>
        </div>
        {cake.tagline && <p className="cake-card__tag muted">{cake.tagline}</p>}
        {cake.servings != null && <p className="cake-card__serves label">Serves {cake.servings}</p>}

        <div className="cake-card__actions">
          <a href={href} className="btn btn-primary btn-sm">{cake.inStock ? "Order this cake" : "Sold out"}</a>
          {hasLayers && (
            <button className="text-link" onClick={() => setOpen((o) => !o)} aria-controls={`cut-${cake.id}`} aria-expanded={open}>
              {open ? "Close" : "See inside"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function SignatureCakeGrid({ cakes }: { cakes: Cake[] }) {
  const occasions = Array.from(new Set(cakes.map((c) => c.occasion).filter(Boolean))) as string[];
  const [filter, setFilter] = useState<string>("All");
  const shown = filter === "All" ? cakes : cakes.filter((c) => c.occasion === filter);
  return (
    <>
      {occasions.length > 1 && (
        <div className="chip-row" style={{ justifyContent: "center", marginBottom: "2rem" }}>
          <button className="chip" aria-pressed={filter === "All"} onClick={() => setFilter("All")}>All cakes</button>
          {occasions.map((o) => (
            <button key={o} className="chip" aria-pressed={filter === o} onClick={() => setFilter(o)}>{o}</button>
          ))}
        </div>
      )}
      <div className="grid grid-3 cake-grid">
        {shown.map((c) => (
          <Card key={c.id} cake={c} />
        ))}
      </div>
    </>
  );
}
