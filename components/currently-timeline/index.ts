import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

interface CurrentlyItem {
  label: string;
  title: string;
  description: string;
  color: string;
}

export class JmCurrentlyTimeline extends JmBase {
  static observedAttributes = ['items'];

  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  private get items(): CurrentlyItem[] {
    try {
      return JSON.parse(this.getAttribute('items') ?? '[]');
    } catch {
      return [];
    }
  }

  private render() {
    const items = this.items;
    if (!items.length) {
      this.shadow.innerHTML = '';
      return;
    }

    const cells = items
      .map((item, i) => {
        const position = i % 2 === 0 ? 'top' : 'bottom';
        const col = i + 1;
        const cardRow = position === 'top' ? 1 : 3;
        const colorVar = `var(--${item.color})`;

        return `
          <article
            class="card ${position}"
            style="grid-column: ${col}; grid-row: ${cardRow}; --item-color: ${colorVar};"
          >
            <h3 class="card-title">${item.title}</h3>
            <p class="card-body">${item.description}</p>
          </article>
          <div
            class="tag"
            style="grid-column: ${col}; grid-row: 2; --item-color: ${colorVar};"
          >
            <span>${item.label}</span>
          </div>
        `;
      })
      .join('');

    this.shadow.innerHTML = `
      <div class="timeline">
        <div class="grid">
          <div class="rail" aria-hidden="true"></div>
          ${cells}
        </div>
      </div>
    `;
  }
}

customElements.define('jm-currently-timeline', JmCurrentlyTimeline);
