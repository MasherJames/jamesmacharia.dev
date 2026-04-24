import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export class JmCursorFollow extends JmBase {
  static observedAttributes = ['cursor', 'max-transform'];

  private midPoints = { x: 0, y: 0 };
  private rateOfChange = { x: 0, y: 0 };

  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.render();
  }

  private get cursorStyle(): string {
    return this.getAttribute('cursor') ?? 'pointer';
  }

  private get maxTransform(): number {
    return Number.parseFloat(this.getAttribute('max-transform') ?? '1.5');
  }

  private handleMouseEnter = (e: MouseEvent) => {
    const target = e.currentTarget as HTMLElement;
    const { height, width } = target.getBoundingClientRect();

    this.midPoints.x = width / 2;
    this.midPoints.y = height / 2;
    this.rateOfChange.x = (this.maxTransform * 2) / width;
    this.rateOfChange.y = (this.maxTransform * 2) / height;
  };

  private handleMouseMove = (e: MouseEvent) => {
    const container = this.shadow.querySelector<HTMLElement>('.cursor-follow');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const xTransform = (offsetX - this.midPoints.x) * this.rateOfChange.x;
    const yTransform = (offsetY - this.midPoints.y) * this.rateOfChange.y;

    container.style.setProperty('--x-transform', `${xTransform}rem`);
    container.style.setProperty('--y-transform', `${yTransform}rem`);
  };

  private handleMouseLeave = () => {
    const container = this.shadow.querySelector<HTMLElement>('.cursor-follow');
    if (!container) return;

    container.style.setProperty('--x-transform', '0rem');
    container.style.setProperty('--y-transform', '0rem');
  };

  private render() {
    this.shadow.innerHTML = `
            <div
                class="cursor-follow"
                style="--cursor: ${this.cursorStyle}; --x-transform: 0rem; --y-transform: 0rem;"
            >
                <slot></slot>
            </div>
        `;

    const container = this.shadow.querySelector('.cursor-follow');
    if (!container) return;

    container.addEventListener('mouseenter', this.handleMouseEnter as EventListener);
    container.addEventListener('mousemove', this.handleMouseMove as EventListener);
    container.addEventListener('mouseleave', this.handleMouseLeave as EventListener);
  }
}

customElements.define('jm-cursor-follow', JmCursorFollow);
