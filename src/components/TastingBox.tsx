import { useEffect, useMemo, useState } from "react";
import { fetchAvailability, minDateISO, validateDate, prettyDate, type Availability } from "../lib/availability";

type Flavor = { name: string; description?: string; isDefault?: boolean; order?: number };
const MAX = 9;

export default function TastingBox({
  productId,
  price,
  flavors,
  buttonLabel,
  buttonClass = "btn btn-primary",
}: {
  productId: string;
  price: string;
  flavors: Flavor[];
  buttonLabel?: string;
  buttonClass?: string;
}) {
  const ordered = useMemo(
    () => [...flavors].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)),
    [flavors]
  );
  const defaults = useMemo(() => {
    const d = ordered.filter((f) => f.isDefault).map((f) => f.name);
    return (d.length ? d : ordered.map((f) => f.name)).slice(0, MAX);
  }, [ordered]);

  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>(defaults);
  const [state, setState] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [avail, setAvail] = useState<Availability | null>(null);
  const [date, setDate] = useState("");
  const [dateErr, setDateErr] = useState("");

  useEffect(() => { fetchAvailability().then(setAvail); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  function onDate(v: string) {
    setDate(v);
    setDateErr(avail ? validateDate(v, avail) : "");
  }

  function toggle(name: string) {
    setPicked((p) => {
      if (p.includes(name)) return p.filter((x) => x !== name);
      if (p.length >= MAX) return p; // full — deselect one to swap
      return [...p, name];
    });
  }

  async function add() {
    if (!avail) return;
    const err = validateDate(date, avail);
    if (err) { setDateErr(err); return; }
    setState("adding");
    try {
      const value = picked.length ? picked.join(", ") : "Chef's selection";
      const r = await fetch("/api/cart-add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: 1,
          // keyed by the product's FREE_TEXT modifier keys
          customText: { "Your nine flavours": value, "Requested date": date },
        }),
      });
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error);
      window.dispatchEvent(new Event("cart-updated"));
      setState("added");
      setTimeout(() => { setState("idle"); setOpen(false); }, 1100);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2600);
    }
  }

  const full = picked.length >= MAX;

  return (
    <>
      <button className={buttonClass} onClick={() => setOpen(true)}>
        {buttonLabel ?? `Choose your flavours · $${price}`}
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)} role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-label="Build your tasting box" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setOpen(false)} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            <div className="modal__head">
              <span className="kicker">{`The Tasting Box · $${price}`}</span>
              <h2>Choose your nine mini cakes</h2>
              <p className="muted">We've picked nine favourites — swap any you like. The full price is credited toward your order within 30 days.</p>
              <span className={"count-pill" + (full ? " is-full" : "")}>{picked.length} / {MAX} chosen</span>
            </div>

            <div className="flavor-grid">
              {ordered.map((f) => {
                const on = picked.includes(f.name);
                const disabled = !on && full;
                return (
                  <button
                    key={f.name}
                    type="button"
                    className={"flavor-chip" + (on ? " is-on" : "") + (disabled ? " is-disabled" : "")}
                    aria-pressed={on}
                    disabled={disabled}
                    onClick={() => toggle(f.name)}
                    title={f.description}
                  >
                    <span className="flavor-chip__tick" aria-hidden="true">
                      {on ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                      ) : "+"}
                    </span>
                    <span className="flavor-chip__body">
                      <span className="flavor-chip__name">{f.name}</span>
                      {f.description && <span className="flavor-chip__desc">{f.description}</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="modal__date field">
              <label htmlFor="tbDate">Choose your date</label>
              <input id="tbDate" type="date" min={avail ? minDateISO(avail.minDays) : undefined} value={date} onChange={(e) => onDate(e.target.value)} />
              {dateErr
                ? <span className="orderbox__err">{dateErr}</span>
                : date
                  ? <span className="orderbox__ok">✓ {prettyDate(date)}</span>
                  : <span className="form-note">Pickup Tue–Sat, at least {avail?.minDays ?? 7} days out.</span>}
            </div>
            <div className="modal__foot">
              <p className="muted" style={{ fontSize: ".82rem", margin: 0 }}>
                {full ? "Your box is full — deselect one to swap." : picked.length < MAX ? `Pick ${MAX - picked.length} more, or we'll add chef's picks.` : ""}
              </p>
              <button className="btn btn-primary" onClick={add} disabled={state === "adding" || !date || !!dateErr}>
                {state === "adding" ? "Adding…" : state === "added" ? "Added to cart ✓" : state === "error" ? "Try again" : `Add tasting box · $${price}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
