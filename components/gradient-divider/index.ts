import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export class JmGradientDivider extends JmBase {
  static observedAttributes = ['variant', 'height'];

  private observer: IntersectionObserver | null = null;

  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.render();
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.classList.add('revealed');
            this.observer?.unobserve(this);
          }
        }
      },
      { threshold: 0.1 },
    );
    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  private get variant(): string {
    return this.getAttribute('variant') ?? 'radial';
  }

  private get height(): string {
    return this.getAttribute('height') ?? '1.5px';
  }

  private render() {
    this.style.setProperty('--height', this.height);
    this.shadow.innerHTML = `<div class="divider ${this.variant}"></div>`;
  }
}

customElements.define('jm-gradient-divider', JmGradientDivider);
