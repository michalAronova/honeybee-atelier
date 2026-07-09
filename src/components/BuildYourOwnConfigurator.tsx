import { useMemo, useState } from "react";
import { SIZES, estimateRange, money } from "../lib/pricing";

type Flavor = { type: string; name: string; description?: string; isPremium?: boolean };

export default function BuildYourOwnConfigurator({
  flavors,
  formId,
}: {
  flavors: Flavor[];
  formId: string;
}) {
  const sponges = flavors.filter((f) => f.type === "Sponge");
  const fillings = flavors.filter((f) => f.type === "Filling");
  const finishes = flavors.filter((f) => f.type === "Finish");

  const [sizeId, setSizeId] = useState(SIZES[1].id);
  const [sponge, setSponge] = useState(sponges[0]?.name ?? "");
  const [chosenFillings, setChosenFillings] = useState<string[]>([]);
  const [finish, setFinish] = useState(finishes[0]?.name ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const size = SIZES.find((s) => s.id === sizeId)!;
  const premiumFillings = fillings.filter((f) => chosenFillings.includes(f.name) && f.isPremium).length;
  const premiumFinish = !!finishes.find((f) => f.name === finish && f.isPremium);
  const est = useMemo(
    () => estimateRange({ sizeId, premiumFillings, premiumFinish }),
    [sizeId, premiumFillings, premiumFinish]
  );

  function toggleFilling(name: string) {
    setChosenFillings((c) => (c.includes(name) ? c.filter((x) => x !== name) : c.length < 3 ? [...c, name] : c));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const cakeDetails = [
      `Size: ${size.label} (~${size.servings} servings, ${size.tiers} tier${size.tiers > 1 ? "s" : ""})`,
      `Sponge: ${sponge}`,
      `Fillings: ${chosenFillings.length ? chosenFillings.join(", ") : "chef's choice"}`,
      `Finish: ${finish}`,
      `Indicative estimate: ${money(est.low)}–${money(est.high)}`,
    ].join(" · ");
    const submissions: Record<string, string> = {
      first_name: String(fd.get("first_name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      occasion: String(fd.get("occasion") || ""),
      event_date: String(fd.get("event_date") || ""),
      servings: String(fd.get("servings") || size.servings),
      cake_details: cakeDetails,
      budget_range: String(fd.get("budget_range") || ""),
      vision_text: String(fd.get("vision_text") || ""),
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
        <p className="muted">Because every cake is made by hand, we'll reply within one business day with availability and a personalized estimate.</p>
        <a href="/showcase" className="btn btn-ghost">Explore the cakes</a>
      </div>
    );
  }

  return (
    <form className="byo" onSubmit={onSubmit}>
      <div className="byo__main">
        <fieldset className="byo__group">
          <legend className="kicker">Your celebration</legend>
          <div className="grid grid-2">
            <div className="field">
              <label htmlFor="occasion">Occasion</label>
              <input id="occasion" name="occasion" required placeholder="Wedding, 40th birthday…" />
            </div>
            <div className="field">
              <label htmlFor="event_date">Event date</label>
              <input id="event_date" name="event_date" type="date" required />
            </div>
          </div>
        </fieldset>

        <fieldset className="byo__group">
          <legend className="kicker">Size</legend>
          <div className="chip-row">
            {SIZES.map((s) => (
              <button type="button" key={s.id} className="chip" aria-pressed={sizeId === s.id} onClick={() => setSizeId(s.id)}>
                {s.label} · ~{s.servings}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="byo__group">
          <legend className="kicker">Sponge</legend>
          <div className="chip-row">
            {sponges.map((s) => (
              <button type="button" key={s.name} className={"chip" + (s.isPremium ? " chip--premium" : "")} aria-pressed={sponge === s.name} onClick={() => setSponge(s.name)} title={s.description}>
                {s.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="byo__group">
          <legend className="kicker">Fillings <span className="muted" style={{ textTransform: "none", letterSpacing: 0 }}>· choose up to 3</span></legend>
          <div className="chip-row">
            {fillings.map((f) => (
              <button type="button" key={f.name} className={"chip" + (f.isPremium ? " chip--premium" : "")} aria-pressed={chosenFillings.includes(f.name)} onClick={() => toggleFilling(f.name)} title={f.description}>
                {f.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="byo__group">
          <legend className="kicker">Finish</legend>
          <div className="chip-row">
            {finishes.map((f) => (
              <button type="button" key={f.name} className={"chip" + (f.isPremium ? " chip--premium" : "")} aria-pressed={finish === f.name} onClick={() => setFinish(f.name)} title={f.description}>
                {f.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="byo__group">
          <legend className="kicker">Your vision</legend>
          <div className="field">
            <label htmlFor="vision_text">Tell us what you're picturing</label>
            <textarea id="vision_text" name="vision_text" placeholder="Colours, inspiration, dietary needs, a Pinterest link — anything that helps us picture your cake."></textarea>
          </div>
        </fieldset>

        <fieldset className="byo__group">
          <legend className="kicker">Your details</legend>
          <div className="grid grid-2">
            <div className="field"><label htmlFor="first_name">Name</label><input id="first_name" name="first_name" required /></div>
            <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div>
            <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" /></div>
            <div className="field"><label htmlFor="servings">Approx. servings</label><input id="servings" name="servings" defaultValue={size.servings} /></div>
            <div className="field"><label htmlFor="budget_range">Budget range</label><input id="budget_range" name="budget_range" placeholder="e.g. $300–$500" /></div>
          </div>
        </fieldset>
      </div>

      <aside className="byo__aside">
        <div className="estimate">
          <span className="kicker">Live estimate</span>
          <div className="estimate__range">{money(est.low)}–{money(est.high)}</div>
          <p className="muted" style={{ fontSize: ".82rem" }}>Estimate, subject to confirmation. Based on ~{est.servings} servings and your selections. Your formal quote follows within one business day.</p>
          <ul className="estimate__recap">
            <li><span>Size</span><span>{size.label}</span></li>
            <li><span>Sponge</span><span>{sponge}</span></li>
            <li><span>Fillings</span><span>{chosenFillings.length ? chosenFillings.join(", ") : "Chef's choice"}</span></li>
            <li><span>Finish</span><span>{finish}</span></li>
          </ul>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Request an estimate"}
          </button>
          {status === "error" && <p className="oos" style={{ fontSize: ".85rem", marginTop: ".6rem" }}>Something went wrong — please try again or email us directly.</p>}
          <p className="muted" style={{ fontSize: ".78rem", marginTop: ".8rem" }}>Custom cakes are quoted individually. Please share your date early — we take a limited number of commissions each week, and ask for at least 7 days' notice (2–4 weeks for weddings and tiered cakes).</p>
        </div>
      </aside>
    </form>
  );
}
