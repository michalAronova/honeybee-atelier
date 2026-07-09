import { useEffect, useState } from "react";
import { fetchAvailability, minDateISO, validateDate, prettyDate, type Availability } from "../lib/availability";

export default function CakeOrderBox({
  productId,
  price,
  inStock,
}: {
  productId: string;
  price: string;
  inStock: boolean;
}) {
  const [avail, setAvail] = useState<Availability | null>(null);
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "adding" | "added" | "error">("idle");

  useEffect(() => { fetchAvailability().then(setAvail); }, []);

  function onDate(v: string) {
    setDate(v);
    setError(avail ? validateDate(v, avail) : "");
  }

  async function add() {
    if (!avail) return;
    const err = validateDate(date, avail);
    if (err) { setError(err); return; }
    setState("adding");
    try {
      const r = await fetch("/api/cart-add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1, customText: { "Requested date": date } }),
      });
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error);
      window.dispatchEvent(new Event("cart-updated"));
      window.dispatchEvent(new Event("open-cart"));
      setState("added");
      setTimeout(() => setState("idle"), 2400);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2600);
    }
  }

  const min = avail ? minDateISO(avail.minDays) : undefined;

  return (
    <div className="orderbox">
      <div className="field">
        <label htmlFor="cakeDate">Choose your date</label>
        <input id="cakeDate" type="date" min={min} value={date} onChange={(e) => onDate(e.target.value)} disabled={!inStock} />
        {error
          ? <span className="orderbox__err">{error}</span>
          : date
            ? <span className="orderbox__ok">✓ {prettyDate(date)} — pickup or local delivery</span>
            : <span className="form-note">Pickup Tue–Sat. Please allow at least {avail?.minDays ?? 7} days — we take a limited number of cakes each day.</span>}
      </div>
      <button className="btn btn-primary" onClick={add} disabled={!inStock || state === "adding" || !date || !!error}>
        {!inStock ? "Sold out"
          : state === "adding" ? "Adding…"
          : state === "added" ? "Added to cart ✓"
          : state === "error" ? "Try again"
          : `Add to cart · $${price}`}
      </button>
    </div>
  );
}
