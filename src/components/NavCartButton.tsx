import { useEffect, useState } from "react";

export default function NavCartButton() {
  const [count, setCount] = useState(0);

  async function refresh() {
    try {
      const r = await fetch("/api/cart");
      const d = await r.json();
      setCount(d.count ?? 0);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("cart-updated", h);
    return () => window.removeEventListener("cart-updated", h);
  }, []);

  return (
    <button
      type="button"
      className="cart-btn"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      onClick={() => window.dispatchEvent(new Event("open-cart"))}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 6h15l-1.5 9h-12z" />
        <path d="M6 6L5 3H2" />
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
      </svg>
      {count > 0 && <span className="cart-badge">{count}</span>}
    </button>
  );
}
