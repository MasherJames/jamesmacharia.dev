import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export class JmCustomCursor extends JmBase {
  private dotEl: HTMLElement | null = null;
  private ringEl: HTMLElement | null = null;
  private mouseX = 0;
  private mouseY = 0;
  private ringX = 0;
  private ringY = 0;
  private animationId = 0;

  constructor() {
    super(styles);
  }

  connectedCallback() {
    // Only on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    this.shadow.innerHTML = `
      <div class="cursor-dot"></div>
      <div class="cursor-ring"></div>
    `;

    this.dotEl = this.shadow.querySelector('.cursor-dot');
    this.ringEl = this.shadow.querySelector('.cursor-ring');

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseenter', this.handleMouseEnter, true);
    document.addEventListener('mouseleave', this.handleMouseLeave, true);

    // Hide default cursor
    document.documentElement.style.cursor = 'none';
    const cursorStyle = document.createElement('style');
    cursorStyle.textContent =
      'a, button, [role="button"], input, textarea, select, label { cursor: none !important; }';
    document.head.appendChild(cursorStyle);

    this.runLoop();
  }

  disconnectedCallback() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseenter', this.handleMouseEnter, true);
    document.removeEventListener('mouseleave', this.handleMouseLeave, true);
    cancelAnimationFrame(this.animationId);
    document.documentElement.style.cursor = '';
  }

  private handleMouseMove = (e: MouseEvent) => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    if (this.dotEl) {
      this.dotEl.style.left = `${this.mouseX}px`;
      this.dotEl.style.top = `${this.mouseY}px`;
    }
  };

  private handleMouseEnter = (e: Event) => {
    const target = e.target as HTMLElement;
    if (this.isInteractive(target)) {
      this.setHovering(true);
    }
  };

  private handleMouseLeave = (e: Event) => {
    const target = e.target as HTMLElement;
    if (this.isInteractive(target)) {
      this.setHovering(false);
    }
  };

  private isInteractive(el: HTMLElement): boolean {
    if (!el?.tagName) return false;
    const tag = el.tagName.toLowerCase();
    return (
      tag === 'a' ||
      tag === 'button' ||
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      tag === 'label' ||
      el.getAttribute('role') === 'button' ||
      el.hasAttribute('onclick') ||
      el.classList.contains('text-link') ||
      el.closest?.('a') !== null ||
      el.closest?.('button') !== null
    );
  }

  private setHovering(hovering: boolean) {
    this.dotEl?.classList.toggle('hovering', hovering);
    this.ringEl?.classList.toggle('hovering', hovering);
  }

  private runLoop = (): void => {
    const lerp = 0.15;
    this.ringX += (this.mouseX - this.ringX) * lerp;
    this.ringY += (this.mouseY - this.ringY) * lerp;

    if (this.ringEl) {
      this.ringEl.style.left = `${this.ringX}px`;
      this.ringEl.style.top = `${this.ringY}px`;
    }

    this.animationId = requestAnimationFrame(this.runLoop);
  };
}

customElements.define('jm-custom-cursor', JmCustomCursor);
