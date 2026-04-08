import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

export class JmDraggableElement extends HTMLElement {
  static observedAttributes = ['rebound', 'bounce-on-rebound'];

  private shadow: ShadowRoot;
  private isDragging = false;
  private shouldAnimateOnRebound = false;
  private position = { left: 0, top: 0 };
  private offset = { x: 0, y: 0 };
  private initialPosition = { left: 0, top: 0 };

  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: () => void;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.adoptedStyleSheets = [styles];
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
  }

  connectedCallback() {
    this.render();
  }

  private get shouldRebound(): boolean {
    return this.hasAttribute('rebound');
  }

  private get shouldBounceOnRebound(): boolean {
    return this.hasAttribute('bounce-on-rebound');
  }

  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    this.isDragging = true;
    this.shouldAnimateOnRebound = false;

    const target = e.currentTarget as HTMLElement;
    this.offset.x = e.offsetX;
    this.offset.y = e.offsetY;
    this.initialPosition.left = target.offsetLeft;
    this.initialPosition.top = target.offsetTop;

    this.updateStyles();

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  };

  private handleMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;

    this.position.left = e.clientX - this.offset.x;
    this.position.top = e.clientY - this.offset.y;
    this.updateStyles();
  }

  private handleMouseUp() {
    this.isDragging = false;

    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);

    if (this.shouldRebound) {
      this.position.left = this.initialPosition.left;
      this.position.top = this.initialPosition.top;
      this.shouldAnimateOnRebound = true;
    }

    this.updateStyles();
  }

  private updateStyles() {
    const container = this.shadow.querySelector<HTMLElement>('.draggable');
    if (!container) return;

    container.style.setProperty('--top', `${this.position.top}px`);
    container.style.setProperty('--left', `${this.position.left}px`);
    container.style.setProperty('--cursor', this.isDragging ? 'grabbing' : 'grab');

    container.classList.toggle('transition', this.shouldAnimateOnRebound);
    container.classList.toggle('bounce', this.shouldAnimateOnRebound && this.shouldBounceOnRebound);
  }

  private render() {
    this.shadow.innerHTML = `
            <div class="draggable" style="--top: 0px; --left: 0px; --cursor: grab;">
                <slot></slot>
            </div>
        `;

    this.shadow
      .querySelector('.draggable')
      ?.addEventListener('mousedown', this.handleMouseDown as EventListener);
  }
}

customElements.define('jm-draggable-element', JmDraggableElement);
