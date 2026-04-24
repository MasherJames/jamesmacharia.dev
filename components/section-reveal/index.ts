import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export class JmSectionReveal extends JmBase {
  private observer: IntersectionObserver | null = null;

  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.shadow.innerHTML = '<slot></slot>';
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
}

customElements.define('jm-section-reveal', JmSectionReveal);
