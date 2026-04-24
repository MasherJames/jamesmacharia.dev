import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

interface Pillar {
  icon: string;
  title: string;
  description: string;
  color: string;
}

export class JmIdentityPillar extends JmBase {
  static observedAttributes = ['pillars'];

  private activeIndex = -1;
  private rotationDeg = 0;
  private rafId: number | null = null;
  private boundHandleScroll: () => void;

  constructor() {
    super(styles);
    this.boundHandleScroll = this.handleScroll.bind(this);
  }

  connectedCallback() {
    this.render();
    window.addEventListener('scroll', this.boundHandleScroll, { passive: true });
    window.addEventListener('resize', this.boundHandleScroll, { passive: true });
    requestAnimationFrame(() => this.handleScroll());
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.boundHandleScroll);
    window.removeEventListener('resize', this.boundHandleScroll);
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  attributeChangedCallback() {
    this.activeIndex = -1;
    this.render();
  }

  private get pillars(): Pillar[] {
    try {
      return JSON.parse(this.getAttribute('pillars') ?? '[]');
    } catch {
      return [];
    }
  }

  private handleScroll() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.updateFromScroll());
  }

  private updateFromScroll() {
    const section = this.shadow.querySelector<HTMLElement>('.pillars-section');
    if (!section) return;

    const pillarCount = this.pillars.length;

    const progress = this.computeProgress(section);

    const segment = 360 / pillarCount;
    const totalRotation = (pillarCount - 1) * segment;
    this.rotationDeg = -progress * totalRotation;

    const newIndex = Math.min(pillarCount - 1, Math.round(progress * (pillarCount - 1)));

    this.applyRotation();
    this.applyActive(newIndex);
  }

  // Progress advances as the section passes through the viewport:
  //   - if section fits (sh < vh), 0 = section-bottom at viewport-bottom,
  //                                1 = section-top at viewport-top.
  //   - if section is taller, 0 = section-top at viewport-top,
  //                           1 = section-bottom at viewport-bottom.
  // In both cases, the cycle runs only while the section is fully in view,
  // so every pillar has a "rest position" where it's well-framed on screen.
  private computeProgress(section: HTMLElement): number {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const sh = rect.height;

    if (sh < vh) {
      const range = vh - sh;
      if (range <= 0) return 0;
      return Math.max(0, Math.min(1, (range - rect.top) / range));
    }
    const range = sh - vh;
    if (range <= 0) return 0;
    return Math.max(0, Math.min(1, -rect.top / range));
  }

  private applyRotation() {
    const arc = this.shadow.querySelector<HTMLElement>('.arc-nodes');
    if (arc) arc.style.setProperty('--rotation', `${this.rotationDeg}deg`);
  }

  private applyActive(index: number) {
    if (index === this.activeIndex) return;
    this.activeIndex = index;

    const pillar = this.pillars[index];
    if (!pillar) return;

    this.style.setProperty('--pillar-color', `var(--${pillar.color})`);

    this.shadow.querySelectorAll('.node').forEach((n, i) => {
      n.classList.toggle('active', i === index);
      n.setAttribute('aria-current', i === index ? 'true' : 'false');
    });

    this.shadow.querySelectorAll('.panel').forEach((p, i) => {
      p.classList.toggle('active', i === index);
    });
  }

  private scrollToPillar(index: number) {
    const section = this.shadow.querySelector<HTMLElement>('.pillars-section');
    if (!section) return;

    const pillarCount = this.pillars.length;
    if (pillarCount < 2) return;

    const rect = section.getBoundingClientRect();
    const sectionTopPage = rect.top + window.scrollY;
    const vh = window.innerHeight;
    const sh = rect.height;
    const targetProgress = index / (pillarCount - 1);

    // Inverse of computeProgress — land on the scroll position where the
    // given pillar's progress matches, so the click "centers" that pillar.
    let target: number;
    if (sh < vh) {
      const range = vh - sh;
      target = sectionTopPage - range * (1 - targetProgress);
    } else {
      const range = sh - vh;
      target = sectionTopPage + range * targetProgress;
    }

    window.scrollTo({ top: target, behavior: 'smooth' });
  }

  private render() {
    const pillars = this.pillars;
    if (!pillars.length) {
      this.shadow.innerHTML = '';
      return;
    }

    const count = pillars.length;
    const step = 360 / count;

    const spokes = pillars
      .map(
        (p, i) => `
          <span
            class="spoke"
            style="--base-angle: ${270 + i * step}deg; --node-color: var(--${p.color})"
            aria-hidden="true"
          ></span>
        `,
      )
      .join('');

    const nodes = pillars
      .map(
        (p, i) => `
          <button
            class="node ${i === 0 ? 'active' : ''}"
            style="--base-angle: ${270 + i * step}deg; --node-color: var(--${p.color})"
            data-index="${i}"
            type="button"
            aria-label="Go to ${p.title}"
            aria-current="${i === 0 ? 'true' : 'false'}"
          >
            <span class="node-icon" aria-hidden="true">${p.icon}</span>
          </button>
        `,
      )
      .join('');

    const panels = pillars
      .map(
        (p, i) => `
          <div class="panel ${i === 0 ? 'active' : ''}" style="--panel-color: var(--${p.color})">
            <h3 class="panel-title">${p.title}</h3>
            <p class="panel-description">${p.description}</p>
          </div>
        `,
      )
      .join('');

    this.style.setProperty('--pillar-color', `var(--${pillars[0].color})`);

    this.shadow.innerHTML = `
      <div class="pillars-section">
        <div class="sticky-wrapper">
          <div class="stage">
            <div class="arc-container" aria-hidden="false">
              <svg class="arc-svg" viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <circle class="arc-ring" cx="0" cy="0" r="90" />
                <circle class="arc-ring arc-ring-inner" cx="0" cy="0" r="72" />
              </svg>
              <div class="arc-nodes" style="--rotation: 0deg">
                ${spokes}
                <span class="arc-core" aria-hidden="true"></span>
                ${nodes}
              </div>
            </div>
            <div class="content" role="region" aria-live="polite">
              ${panels}
            </div>
          </div>
        </div>
      </div>
    `;

    this.shadow.querySelectorAll<HTMLElement>('.node').forEach((node) => {
      node.addEventListener('click', (e) => {
        const idx = Number((e.currentTarget as HTMLElement).dataset.index);
        if (!Number.isNaN(idx)) this.scrollToPillar(idx);
      });
    });
  }
}

customElements.define('jm-identity-pillar', JmIdentityPillar);
