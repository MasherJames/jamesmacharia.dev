import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export class JmStatusDot extends JmBase {
  static observedAttributes = ['available', 'label'];

  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  private get isAvailable(): boolean {
    return this.hasAttribute('available');
  }

  private get label(): string {
    return this.getAttribute('label') ?? '';
  }

  private render() {
    this.shadow.innerHTML = `
      <span class="status">
        <span class="dot ${this.isAvailable ? 'active' : ''}"></span>
        ${this.label ? `<span class="label">${this.label}</span>` : ''}
      </span>
    `;
  }
}

customElements.define('jm-status-dot', JmStatusDot);
