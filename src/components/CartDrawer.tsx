import { useEffect, useState } from "react";

type Item = { id: string; name: string; price: string; quantity: number; image: string; href?: string | null; custom?: { title: string; value: string }[] };

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // slide the drawer back out, then unmount
  function close() {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 320);
  }

  async function load() {
    try {
      const r = await fetch("/api/cart");
      const d = await r.json();
      setItems(d.items ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => {
    const onOpen = () => { setClosing(false); setOpen(true); load(); };
    const onUpdate = () => load();
    window.addEventListener("open-cart", onOpen);
    window.addEventListener("cart-updated", onUpdate);
    return () => { window.removeEventListener("open-cart", onOpen); window.removeEventListener("cart-updated", onUpdate); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  async function change(id: string, quantity: number) {
    setBusy(true);
    await fetch("/api/cart-update", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lineItemId: id, quantity }) });
    window.dispatchEvent(new Event("cart-updated"));
    await load();
    setBusy(false);
  }

  async function checkout() {
    setBusy(true);
    const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ origin: window.location.origin }) });
    const d = await r.json();
    if (d.url) window.location.href = d.url;
    else { setBusy(false); alert("Sorry — checkout could not start. Please try again."); }
  }

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  if (!open && !closing) return null;

  return (
    <div className={"drawer-backdrop" + (closing ? " is-closing" : "")} onClick={close} role="presentation">
      <aside className={"drawer" + (closing ? " is-closing" : "")} role="dialog" aria-modal="true" aria-label="Your cart" onClick={(e) => e.stopPropagation()}>
        <header className="drawer__head">
          <span className="kicker" style={{ margin: 0 }}>Your cart{count ? ` · ${count}` : ""}</span>
          <button className="drawer__close" onClick={close} aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>

        <div className="drawer__body">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : items.length === 0 ? (
            <div className="drawer__empty">
              <p className="lead" style={{ fontSize: "1.05rem" }}>Your cart is empty.</p>
              <a href="/showcase" className="btn btn-primary" onClick={close}>Explore the cakes</a>
            </div>
          ) : (
            <ul className="drawer__lines">
              {items.map((it) => (
                <li key={it.id} className="drawer-line">
                  {it.href ? (
                    <a className="drawer-line__media" href={it.href} onClick={close} aria-label={`View ${it.name}`}>
                      {it.image ? <img className="img-cover" src={it.image} alt={it.name} width={72} height={72} /> : <div className="ph" />}
                    </a>
                  ) : (
                    <div className="drawer-line__media">
                      {it.image ? <img className="img-cover" src={it.image} alt={it.name} width={72} height={72} /> : <div className="ph" />}
                    </div>
                  )}
                  <div className="drawer-line__info">
                    <div className="drawer-line__top">
                      <h3>{it.href ? <a href={it.href} onClick={close}>{it.name}</a> : it.name}</h3>
                      <span className="price">${(Number(it.price) * it.quantity).toLocaleString("en-US")}</span>
                    </div>
                    {it.custom?.map((c) => (
                      <p className="drawer-line__custom" key={c.title}><strong>{c.title}:</strong> {c.value}</p>
                    ))}
                    <div className="drawer-line__foot">
                      <div className="qty" role="group" aria-label={`Quantity for ${it.name}`}>
                        <button onClick={() => change(it.id, it.quantity - 1)} disabled={busy} aria-label="Decrease">–</button>
                        <span aria-live="polite">{it.quantity}</span>
                        <button onClick={() => change(it.id, it.quantity + 1)} disabled={busy} aria-label="Increase">+</button>
                      </div>
                      <button className="link-underline" onClick={() => change(it.id, 0)} disabled={busy}>Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="drawer__foot">
            <div className="drawer__subtotal"><span>Subtotal</span><span className="price">${subtotal.toLocaleString("en-US")}</span></div>
            <p className="muted" style={{ fontSize: ".78rem", margin: "0 0 .8rem" }}>Taxes, delivery, and any deposit terms are confirmed at checkout.</p>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={checkout} disabled={busy}>{busy ? "Working…" : "Checkout"}</button>
            <a href="/cart" className="btn btn-ghost" style={{ width: "100%", marginTop: ".6rem" }} onClick={close}>View full cart</a>
          </footer>
        )}
      </aside>
    </div>
  );
}
