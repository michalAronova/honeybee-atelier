import { useState } from "react";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  half?: boolean;
};

export default function InquiryForm({
  formId,
  fields,
  submitLabel = "Send",
}: {
  formId: string;
  fields: FieldDef[];
  submitLabel?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const submissions: Record<string, string> = {};
    for (const f of fields) submissions[f.name] = String(fd.get(f.name) || "");
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
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="inquiry">
      <div className="grid grid-2">
        {fields.map((f) => (
          <div className={"field" + (f.type === "textarea" || !f.half ? " field--full" : "")} key={f.name}>
            <label htmlFor={f.name}>{f.label}{f.required ? " *" : ""}</label>
            {f.type === "textarea" ? (
              <textarea id={f.name} name={f.name} required={f.required} placeholder={f.placeholder}></textarea>
            ) : f.type === "select" ? (
              <select id={f.name} name={f.name} required={f.required} defaultValue="">
                <option value="" disabled>Select…</option>
                {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input id={f.name} name={f.name} type={f.type ?? "text"} required={f.required} placeholder={f.placeholder} />
            )}
          </div>
        ))}
      </div>
      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : submitLabel}
      </button>
      {status === "error" && <p className="oos" style={{ marginTop: ".8rem" }}>Something went wrong — please try again or email hello@honeybeeatelier.com.</p>}
    </form>
  );
}
