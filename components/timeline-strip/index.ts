import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

interface TimelineItem {
  period: string;
  role: string;
  company: string;
  description?: string;
  current?: boolean;
}

export class JmTimelineStrip extends JmBase {
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

  private get items(): TimelineItem[] {
    try {
      return JSON.parse(this.getAttribute('items') ?? '[]');
    } catch {
      return [];
    }
  }

  private render() {
    const entries = this.items
      .map(
        (item) => `
      <div class="entry ${item.current ? 'current' : ''}">
        <span class="period">${item.period}</span>
        <div class="role-line">
          <span class="role">${item.role}</span>
          <span class="at"> · </span>
          <span class="company">${item.company}</span>
        </div>
        ${item.description ? `<p class="description">${item.description}</p>` : ''}
      </div>
    `,
      )
      .join('');

    this.shadow.innerHTML = `
      <div class="timeline">
        <div class="line"></div>
        ${entries}
      </div>
    `;
  }
}

customElements.define('jm-timeline-strip', JmTimelineStrip);
