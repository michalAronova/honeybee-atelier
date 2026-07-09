import { quickStartViewerPlugins, RicosViewer } from "@wix/ricos";
import "@wix/ricos/css/all-plugins-viewer.css";

const plugins = quickStartViewerPlugins();

export default function RicosBody({ content }: { content: any }) {
  if (!content) return null;
  return (
    <div className="ricos-content">
      <RicosViewer content={content} plugins={plugins} />
    </div>
  );
}
