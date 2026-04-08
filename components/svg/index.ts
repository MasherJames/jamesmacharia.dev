import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export class JmSvg extends HTMLElement {
  static observedAttributes = [
    'width',
    'height',
    'viewbox',
    'targets',
    'sprite',
    'stroke-width',
    'color',
    'preserve-aspect-ratio',
  ];

  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.adoptedStyleSheets = [styles];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
    const width = this.getAttribute('width') ?? '24px';
    const height = this.getAttribute('height') ?? '24px';
    const viewBox = this.getAttribute('viewbox') ?? '0 0 24 24';
    const preserveAspectRatio = this.getAttribute('preserve-aspect-ratio') ?? 'xMidYMid meet';
    const sprite = this.getAttribute('sprite') ?? '';
    const strokeWidth = this.getAttribute('stroke-width') ?? '';
    const color = this.getAttribute('color') ?? '';
    const targets = this.getAttribute('targets')?.split(',') ?? [];

    const colorClass = color ? `x-${color}` : '';
    const useElements = targets
      .map((target) => {
        const extra = strokeWidth ? `stroke-width="${strokeWidth}"` : '';
        return `<use href="${sprite}#${target.trim()}" ${extra}></use>`;
      })
      .join('');

    this.shadow.innerHTML = `
            <svg
                class="${colorClass}"
                width="${width}"
                height="${height}"
                viewBox="${viewBox}"
                preserveAspectRatio="${preserveAspectRatio}"
                xmlns="http://www.w3.org/2000/svg"
            >
                ${useElements}
                <slot></slot>
            </svg>
        `;
  }
}

customElements.define('jm-svg', JmSvg);
