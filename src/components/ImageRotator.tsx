import { useEffect, useState } from "react";

export default function ImageRotator({
  images,
  interval = 3800,
}: {
  images: { url: string; alt: string }[];
  interval?: number;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % images.length), interval);
    return () => clearInterval(t);
  }, [images.length, interval]);

  return (
    <div className="rotator">
      {images.map((im, idx) => (
        <img
          key={idx}
          src={im.url}
          alt={idx === 0 ? im.alt : ""}
          aria-hidden={idx === i ? undefined : true}
          className={"rotator__img" + (idx === i ? " is-active" : "")}
          loading={idx === 0 ? "eager" : "lazy"}
        />
      ))}
      {images.length > 1 && (
        <div className="rotator__dots" aria-hidden="true">
          {images.map((_, idx) => (
            <span key={idx} className={idx === i ? "is-on" : ""} />
          ))}
        </div>
      )}
    </div>
  );
}
