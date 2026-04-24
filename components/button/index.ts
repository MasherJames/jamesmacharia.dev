import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export class JmButton extends JmBase {
  static observedAttributes = ['label', 'primary', 'size', 'background-color'];

  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  private get isPrimary(): boolean {
    return this.hasAttribute('primary');
  }

  private get size(): string {
    return this.getAttribute('size') ?? 'medium';
  }

  private get label(): string {
    return this.getAttribute('label') ?? '';
  }

  private get backgroundColor(): string | null {
    return this.getAttribute('background-color');
  }

  private render() {
    const variant = this.isPrimary ? 'primary' : 'secondary';
    const bgStyle = this.backgroundColor ? `background-color: ${this.backgroundColor};` : '';

    this.shadow.innerHTML = `
            <button class="${variant} ${this.size}" style="${bgStyle}">
                ${this.label}
            </button>
        `;

    this.shadow.querySelector('button')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('button-click', { bubbles: true, composed: true }));
    });
  }
}

customElements.define('jm-button', JmButton);
