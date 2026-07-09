import { useEffect, useState } from "react";

type Item = { id: string; name: string; price: string; quantity: number; image: string; href?: string | null; custom?: { title: string; value: string }[] };

export default function CartView() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    const r = await fetch("/api/cart");
    const d = await r.json();
    setItems(d.items ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function change(id: string, quantity: number) {
    setBusy(true);
    await fetch("/api/cart-update", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lineItemId: id, quantity }),
    });
    window.dispatchEvent(new Event("cart-updated"));
    await load();
    setBusy(false);
  }

  async function checkout() {
    setBusy(true);
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ origin: window.location.origin }),
    });
    const d = await r.json();
    if (d.url) window.location.href = d.url;
    else { setBusy(false); alert("Sorry — checkout could not start. Please try again."); }
  }

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  if (loading) return <p className="muted">Loading your cart…</p>;
  if (items.length === 0)
    return (
      <div className="stack">
        <p className="lead">Your cart is empty.</p>
        <a href="/showcase" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Explore the cakes</a>
      </div>
    );

  return (
    <div className="cart-layout">
      <ul className="cart-lines">
        {items.map((it) => (
          <li key={it.id} className="cart-line">
            {it.href ? (
              <a className="cart-line__media ratio-1x1" href={it.href} aria-label={`View ${it.name}`}>
                {it.image ? <img className="img-cover" src={it.image} alt={it.name} width={96} height={96} /> : <div className="ph" />}
              </a>
            ) : (
              <div className="cart-line__media ratio-1x1">
                {it.image ? <img className="img-cover" src={it.image} alt={it.name} width={96} height={96} /> : <div className="ph" />}
              </div>
            )}
            <div className="cart-line__info">
              <h3>{it.href ? <a href={it.href}>{it.name}</a> : it.name}</h3>
              {it.custom?.map((c) => (
                <p className="cart-line__custom" key={c.title}><strong>{c.title}:</strong> {c.value}</p>
              ))}
              <div className="qty" role="group" aria-label={`Quantity for ${it.name}`}>
                <button onClick={() => change(it.id, it.quantity - 1)} disabled={busy} aria-label="Decrease">–</button>
                <span aria-live="polite">{it.quantity}</span>
                <button onClick={() => change(it.id, it.quantity + 1)} disabled={busy} aria-label="Increase">+</button>
              </div>
            </div>
            <div className="cart-line__end">
              <span className="cart-line__price price">${(Number(it.price) * it.quantity).toLocaleString("en-US")}</span>
              <button className="cart-line__remove link-underline" onClick={() => change(it.id, 0)} disabled={busy}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <aside className="cart-summary">
        <h3>Order summary</h3>
        <div className="cart-summary__row"><span>Subtotal</span><span className="price">${subtotal.toLocaleString("en-US")}</span></div>
        <p className="muted" style={{ fontSize: ".85rem" }}>Taxes, delivery, and any deposit terms are confirmed at checkout.</p>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={checkout} disabled={busy}>
          {busy ? "Starting checkout…" : "Checkout"}
        </button>
        <a href="/showcase" className="link-underline" style={{ display: "inline-block", marginTop: "1rem" }}>Continue browsing</a>
      </aside>
    </div>
  );
}
