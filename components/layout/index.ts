import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export class JmLayout extends JmBase {
  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.render();
  }

  private get currentYear(): number {
    return new Date().getFullYear();
  }

  private render() {
    this.shadow.innerHTML = `
      <jm-custom-cursor></jm-custom-cursor>
      <jm-navigation></jm-navigation>
      <main>
        <slot></slot>
      </main>
      <footer>
        <div class="footer-inner">
          <span class="footer-copy">&copy; ${this.currentYear} James Macharia</span>
          <ul class="footer-links">
            <li><a href="https://github.com/MasherJames" target="_blank" rel="noopener">GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/james-macharia-b53963160/" target="_blank" rel="noopener">LinkedIn</a></li>
            <li><a href="https://x.com/MasherJames" target="_blank" rel="noopener">X</a></li>
          </ul>
        </div>
      </footer>
    `;
  }
}

customElements.define('jm-layout', JmLayout);
