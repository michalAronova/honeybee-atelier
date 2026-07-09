import { layerTone, onTone, layerIcon, layerType } from "../lib/cutaway";
import LayerIcon from "./LayerIcon";

// Static (server-rendered) version of the cutaway — the layers shown as labeled bands.
export default function LayerList({ layers }: { layers: string[] }) {
  if (!layers?.length) return null;
  return (
    <ol className="layer-list">
      {layers.map((l, i) => {
        const tone = layerTone(l);
        return (
          <li className="layer-row" key={i}>
            <span className="layer-swatch" style={{ background: tone, color: onTone(tone) }}>
              <LayerIcon kind={layerIcon(l)} />
            </span>
            <span className="layer-name">{l}</span>
            <span className="layer-type">{layerType(l)}</span>
          </li>
        );
      })}
    </ol>
  );
}
