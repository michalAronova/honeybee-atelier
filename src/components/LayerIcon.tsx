import type { IconKind } from "../lib/cutaway";

// Fine-line flavour icons — inherit currentColor.
const PATHS: Record<IconKind, React.ReactNode> = {
  berry: (
    <>
      <circle cx="9" cy="13" r="3" /><circle cx="15" cy="13" r="3" /><circle cx="12" cy="17.5" r="3" />
      <path d="M12 9c0-2 1.2-3.5 3-4" />
    </>
  ),
  lemon: (
    <>
      <ellipse cx="12" cy="13" rx="7" ry="5" transform="rotate(-25 12 13)" />
      <path d="M16 7c1.5-1.5 3-1.8 4-1.5-.2 1.4-.9 2.7-2.2 3.4" />
    </>
  ),
  chocolate: (
    <>
      <rect x="5" y="6" width="14" height="12" rx="1.5" />
      <path d="M12 6v12 M5 12h14" />
    </>
  ),
  caramel: <path d="M12 4c3.5 5 5.5 7.3 5.5 10a5.5 5.5 0 11-11 0c0-2.7 2-5 5.5-10z" />,
  cream: (
    <>
      <path d="M6 15c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M12 4c2 1.6 2 4 0 5.2M12 9.2c-2 0-3 1.2-3 2.8" />
      <path d="M6 15h12v1.5a3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </>
  ),
  sponge: (
    <>
      <rect x="4" y="7" width="16" height="4.5" rx="1" />
      <rect x="4" y="12.5" width="16" height="4.5" rx="1" />
    </>
  ),
  honey: (
    <>
      <path d="M12 4l6 3.5v7L12 18l-6-3.5v-7z" />
      <path d="M12 8.5l2.5 1.5v3L12 14.5 9.5 13v-3z" />
    </>
  ),
  pistachio: (
    <>
      <path d="M8 6c5 0 9 3.5 9 8s-4 4-7 2-5-6-2-10z" />
      <path d="M11 9c1.5.6 2.6 1.8 3 3.5" />
    </>
  ),
  rose: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 4a3 3 0 013 3M12 4a3 3 0 00-3 3M20 12a3 3 0 01-3 3M20 12a3 3 0 00-3-3M4 12a3 3 0 003 3M4 12a3 3 0 013-3M12 20a3 3 0 003-3M12 20a3 3 0 01-3-3" />
    </>
  ),
  fig: (
    <>
      <path d="M12 8c3.5 0 6 3 6 6a4 4 0 01-4 4h-4a4 4 0 01-4-4c0-3 2.5-6 6-6z" />
      <path d="M12 8V5 M12 5c-1.2 0-2-.8-2-2 1.2 0 2 .8 2 2zm0 0c1.2 0 2-.8 2-2-1.2 0-2 .8-2 2z" />
      <path d="M11 13v.01 M13.5 14.5v.01 M12 16v.01" />
    </>
  ),
  champagne: (
    <>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M18 15l.7 1.8L20.5 17.5l-1.8.7L18 20l-.7-1.8L15.5 17.5l1.8-.7z" />
    </>
  ),
  buttercream: (
    <>
      <path d="M4 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
      <path d="M4 15c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
    </>
  ),
  elderflower: (
    <>
      <path d="M12 12V21 M12 12l4-4 M12 15l-4-3" />
      <circle cx="7" cy="6" r="1.6" /><circle cx="12" cy="4.5" r="1.6" /><circle cx="17" cy="6" r="1.6" />
      <circle cx="9.5" cy="9" r="1.4" /><circle cx="14.5" cy="9" r="1.4" />
    </>
  ),
};

export default function LayerIcon({ kind }: { kind: IconKind }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[kind]}
    </svg>
  );
}
