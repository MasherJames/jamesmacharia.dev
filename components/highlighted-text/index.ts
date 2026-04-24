import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export class JmHighlightedText extends JmBase {
  static observedAttributes = ['text', 'highlight'];

  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.render();
  }

  private get text(): string {
    return this.getAttribute('text') ?? '';
  }

  private get highlightWords(): string[] {
    const raw = this.getAttribute('highlight') ?? '';
    return raw
      .split(',')
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);
  }

  private render() {
    const words = this.text.split(/\s+/).filter(Boolean);
    const highlights = this.highlightWords;

    const spans = words
      .map((word) => {
        const isHighlight = highlights.some(
          (h) => word.toLowerCase().replace(/[.,!?;:]/g, '') === h,
        );
        return `<span class="word ${isHighlight ? 'highlight' : ''}">${word}</span>`;
      })
      .join('');

    this.shadow.innerHTML = `<div class="text-container">${spans}</div>`;
  }
}

customElements.define('jm-highlighted-text', JmHighlightedText);
