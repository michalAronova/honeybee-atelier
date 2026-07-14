import { useEffect } from "react";
import { quickStartViewerPlugins, RicosViewer } from "@wix/ricos";
// import the CSS as a URL only — keeps this heavy stylesheet off every non-blog page;
// it's injected at runtime when a post actually renders.
import ricosCssUrl from "@wix/ricos/css/all-plugins-viewer.css?url";

const plugins = quickStartViewerPlugins();

export default function RicosBody({ content }: { content: any }) {
  useEffect(() => {
    if (document.querySelector("link[data-ricos-css]")) return;
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = ricosCssUrl;
    l.setAttribute("data-ricos-css", "");
    document.head.appendChild(l);
  }, []);

  if (!content) return null;
  return (
    <div className="ricos-content">
      <RicosViewer content={content} plugins={plugins} />
    </div>
  );
}
