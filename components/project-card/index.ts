import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export class JmProjectCard extends JmBase {
  static observedAttributes = ['name', 'description', 'tags', 'href'];

  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  private get projectName(): string {
    return this.getAttribute('name') ?? '';
  }

  private get description(): string {
    return this.getAttribute('description') ?? '';
  }

  private get tags(): string[] {
    const raw = this.getAttribute('tags') ?? '';
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  private get href(): string | null {
    return this.getAttribute('href');
  }

  private render() {
    const tagsHtml = this.tags.map((tag) => `<span class="tag">${tag}</span>`).join('');

    if (this.href) {
      this.shadow.innerHTML = `
        <a class="card" href="${this.href}" target="_blank" rel="noopener">
          <h3 class="name">${this.projectName}</h3>
          <p class="description">${this.description}</p>
          <div class="card-footer">
            <div class="tags">${tagsHtml}</div>
            <span class="arrow">&rarr;</span>
          </div>
        </a>
      `;
    } else {
      this.shadow.innerHTML = `
        <div class="card no-link">
          <h3 class="name">${this.projectName}</h3>
          <p class="description">${this.description}</p>
          <div class="tags">${tagsHtml}</div>
        </div>
      `;
    }
  }
}

customElements.define('jm-project-card', JmProjectCard);
