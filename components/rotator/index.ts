import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export enum RotationScrollTarget {
  Children = 'children',
  Parent = 'parent',
  Rotator = 'rotator',
}

export class JmRotator extends HTMLElement {
  static observedAttributes = ['scroll-target', 'target', 'width', 'height', 'rounded', 'color'];

  private shadow: ShadowRoot;
  private rotationDeg = 0;
  private scrollHandler: (() => void) | null = null;
  private currentScrollTarget: HTMLElement | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.adoptedStyleSheets = [styles];
  }

  connectedCallback() {
    this.render();
    this.bindScrollTarget();
  }

  disconnectedCallback() {
    this.unbindScrollTarget();
  }

  attributeChangedCallback() {
    this.render();
    this.bindScrollTarget();
  }

  private get target(): RotationScrollTarget {
    return (this.getAttribute('target') as RotationScrollTarget) ?? RotationScrollTarget.Rotator;
  }

  private get isRounded(): boolean {
    return this.hasAttribute('rounded');
  }

  private get color(): string {
    return this.getAttribute('color') ?? 'accent';
  }

  private unbindScrollTarget() {
    if (this.currentScrollTarget && this.scrollHandler) {
      this.currentScrollTarget.removeEventListener('scroll', this.scrollHandler);
    }
  }

  private bindScrollTarget() {
    this.unbindScrollTarget();

    const selector = this.getAttribute('scroll-target');
    if (!selector) return;

    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;

    this.currentScrollTarget = el;
    this.scrollHandler = () => {
      const { scrollHeight, scrollTop } = el;
      if (scrollHeight && scrollTop) {
        this.rotationDeg = (scrollTop / scrollHeight) * 360;
        this.updateRotation();
      }
    };

    el.addEventListener('scroll', this.scrollHandler);
  }

  private updateRotation() {
    const container = this.shadow.querySelector<HTMLElement>('.rotator');
    if (!container) return;
    container.style.setProperty('--rotation-deg', `${this.rotationDeg}deg`);
    container.style.setProperty('--counter-rotation-deg', `-${this.rotationDeg}deg`);
  }

  private render() {
    const targetClass =
      this.target === RotationScrollTarget.Children
        ? 'rotatechildren'
        : this.target === RotationScrollTarget.Parent
          ? 'rotateparent'
          : 'rotateboth';

    const classes = ['rotator', this.isRounded ? 'rounded' : '', targetClass, `x-${this.color}`]
      .filter(Boolean)
      .join(' ');

    const width = this.getAttribute('width');
    const height = this.getAttribute('height');

    const inlineStyles = [
      `--rotation-deg: ${this.rotationDeg}deg`,
      `--counter-rotation-deg: -${this.rotationDeg}deg`,
      width ? `--width: ${width}rem` : '',
      height ? `--height: ${height}rem` : '',
    ]
      .filter(Boolean)
      .join(';');

    this.shadow.innerHTML = `
            <div class="${classes}" style="${inlineStyles}">
                <slot></slot>
            </div>
        `;
  }
}

customElements.define('jm-rotator', JmRotator);
