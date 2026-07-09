import { useState } from "react";

export type CateringItem = {
  name: string;
  category: string;
  priceFrom: string;
  minQuantity: string;
  description: string;
  imageUrl: string;
};

export default function CateringBuilder({ items, formId }: { items: CateringItem[]; formId: string }) {
  const cats = Array.from(new Set(items.map((i) => i.category)));
  const [active, setActive] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const shown = active === "All" ? items : items.filter((i) => i.category === active);

  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const submissions: Record<string, string> = {
      first_name: String(fd.get("first_name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      event_type: String(fd.get("event_type") || ""),
      event_date: String(fd.get("event_date") || ""),
      guest_count: String(fd.get("guest_count") || ""),
      items: selected.join(", "),
      message: String(fd.get("message") || ""),
    };
    try {
      const r = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ formId, submissions }),
      });
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="thanks">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.4"><path d="M5 13l4 4L19 7" /></svg>
        <h3>Thank you — your request is with the atelier.</h3>
        <p className="muted">Because every order is made by hand, we'll reply within one business day with availability and a personalized quote.</p>
      </div>
    );
  }

  return (
    <form className="byo" onSubmit={onSubmit}>
      <div className="byo__main">
        <fieldset className="byo__group">
          <legend className="kicker">The menu · tap to add to your enquiry</legend>
          <div className="chip-row" style={{ marginBottom: "1.25rem" }}>
            <button type="button" className="chip" aria-pressed={active === "All"} onClick={() => setActive("All")}>All</button>
            {cats.map((c) => (
              <button type="button" key={c} className="chip" aria-pressed={active === c} onClick={() => setActive(c)}>{c}</button>
            ))}
          </div>
          <div className="grid grid-2">
            {shown.map((it) => {
              const on = selected.includes(it.name);
              return (
                <article key={it.name} className={"cater-card" + (on ? " is-selected" : "")}>
                  <div className="cater-card__media ratio-3x2">
                    {it.imageUrl ? <img className="img-cover" src={it.imageUrl} alt={`${it.name} — ${it.description}`} loading="lazy" width={420} height={280} /> : <div className="ph" />}
                    <span className="pill cater-card__cat">{it.category}</span>
                  </div>
                  <div className="cater-card__body">
                    <div className="cater-card__head">
                      <h3>{it.name}</h3>
                      <span className="price cater-card__price">{it.priceFrom}</span>
                    </div>
                    <p className="muted cater-card__desc">{it.description}</p>
                    <div className="cater-card__foot">
                      {it.minQuantity && it.minQuantity !== "—" ? <span className="label">Min {it.minQuantity}</span> : <span className="label">Made to order</span>}
                      <button type="button" className={on ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"} onClick={() => toggle(it.name)} aria-pressed={on}>
                        {on ? "Added ✓" : "Add"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="byo__group">
          <legend className="kicker">Your event</legend>
          <div className="grid grid-2">
            <div className="field"><label htmlFor="event_type">Event type</label><input id="event_type" name="event_type" required placeholder="Wedding, corporate, shower…" /></div>
            <div className="field"><label htmlFor="event_date">Event date</label><input id="event_date" name="event_date" type="date" required /></div>
            <div className="field"><label htmlFor="guest_count">Guest count</label><input id="guest_count" name="guest_count" required /></div>
          </div>
          <div className="field"><label htmlFor="message">Anything else? (colours, theme, dietary needs)</label><textarea id="message" name="message" placeholder="Tell us about your event — palette, vibe, any must-haves."></textarea></div>
        </fieldset>

        <fieldset className="byo__group">
          <legend className="kicker">Your details</legend>
          <div className="grid grid-2">
            <div className="field"><label htmlFor="first_name">Name</label><input id="first_name" name="first_name" required /></div>
            <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div>
            <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" /></div>
          </div>
        </fieldset>
      </div>

      <aside className="byo__aside">
        <div className="estimate">
          <span className="kicker">Your enquiry</span>
          {selected.length === 0 ? (
            <p className="muted" style={{ fontSize: ".9rem" }}>Tap <strong>Add</strong> on the treats you're interested in — they'll gather here. Not sure yet? Just send your event details and we'll suggest a spread.</p>
          ) : (
            <ul className="enquiry-chips">
              {selected.map((n) => (
                <li key={n}>
                  {n}
                  <button type="button" onClick={() => toggle(n)} aria-label={`Remove ${n}`}>×</button>
                </li>
              ))}
            </ul>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send my enquiry"}
          </button>
          {status === "error" && <p className="oos" style={{ fontSize: ".85rem", marginTop: ".6rem" }}>Something went wrong — please try again or email hello@honeybeeatelier.com.</p>}
          <p className="muted" style={{ fontSize: ".78rem", marginTop: ".9rem" }}>Catering is quoted individually. Prices shown are a guide; share your date early — we take a limited number of commissions each week.</p>
        </div>
      </aside>
    </form>
  );
}
