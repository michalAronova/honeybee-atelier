import { useState } from "react";

export default function AddToCartButton({
  productId,
  label = "Add to cart",
  className = "btn btn-primary",
}: {
  productId: string;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "adding" | "added" | "error">("idle");

  async function add() {
    setState("adding");
    try {
      const r = await fetch("/api/cart-add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error);
      window.dispatchEvent(new Event("cart-updated"));
      setState("added");
      setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2600);
    }
  }

  return (
    <button className={className} onClick={add} disabled={state === "adding"}>
      {state === "adding" ? "Adding…" : state === "added" ? "Added to cart ✓" : state === "error" ? "Try again" : label}
    </button>
  );
}
