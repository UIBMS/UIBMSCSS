import {esc} from './config.mjs';
import {sparklinePoints} from '../../../extensions/engines/dashboard/sparkline.mjs';

function sparklineSvg(values) {
  const points=sparklinePoints(values);
  const shape=points.length===1
    ? '<circle cx="'+points[0][0]+'" cy="'+points[0][1]+'" r="2"></circle>'
    : points.length>1
      ? '<polyline points="'+points.map(point=>point.map(value=>Number(value.toFixed(4))).join(',')).join(' ')+'"></polyline>'
      : '';
  return '<svg aria-hidden="true" viewBox="0 0 100 40" preserveAspectRatio="none">'+shape+'</svg>';
}

export function staticSparkline(label,values,summary) {
  const list=values.map(value=>'      <li><data value="'+value+'">'+value+'</data></li>').join('\n');
  return `<figure class="sparkline">
  ${sparklineSvg(values)}
  <figcaption>${esc(summary)}</figcaption>
  <details>
    <summary>${esc(label)}</summary>
    <ol>
${list}
    </ol>
  </details>
</figure>`;
}
