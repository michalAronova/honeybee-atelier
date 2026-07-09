import type { APIRoute } from "astro";
import { submissions } from "@wix/forms";
import { json } from "./cart";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { formId, submissions: values } = await request.json();
    if (!formId || !values) return json({ error: "missing formId or values" }, 400);
    // strip empty values so optional/unfilled fields don't trip validation
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(values)) {
      if (v !== undefined && v !== null && String(v).trim() !== "") clean[k] = v;
    }
    const res = await submissions.createSubmission({ formId, submissions: clean });
    return json({ ok: true, id: res._id });
  } catch (e: any) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
};
