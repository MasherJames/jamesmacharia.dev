import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

interface CarouselCard {
  company: string;
  title: string;
  description: string;
  tags: string[];
  accentColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
}

export class JmStackedCarousel extends JmBase {
  static observedAttributes = ['cards', 'intro-title', 'intro-subtitle'];

  private activeIndex = 0;
  private boundHandleScroll: () => void;

  constructor() {
    super(styles);
    this.boundHandleScroll = this.handleScroll.bind(this);
  }

  connectedCallback() {
    this.render();
    window.addEventListener('scroll', this.boundHandleScroll, { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.boundHandleScroll);
  }

  private get cards(): CarouselCard[] {
    try {
      return JSON.parse(this.getAttribute('cards') ?? '[]');
    } catch {
      return [];
    }
  }

  private get introTitle(): string {
    return this.getAttribute('intro-title') ?? '';
  }

  private get introSubtitle(): string {
    return this.getAttribute('intro-subtitle') ?? '';
  }

  private handleScroll() {
    const section = this.shadow.querySelector('.carousel-section') as HTMLElement;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollProgress = Math.max(0, Math.min(1, -rect.top / (sectionHeight - viewportHeight)));

    const cardCount = this.cards.length;
    if (cardCount === 0) return;

    const newIndex = Math.min(cardCount - 1, Math.floor(scrollProgress * cardCount));

    this.updateCards(newIndex, scrollProgress);
    this.updateProgressRing(scrollProgress);
    this.updateIntroGradient(newIndex);
  }

  private updateCards(newIndex: number, _progress: number) {
    if (newIndex === this.activeIndex) return;
    this.activeIndex = newIndex;

    const cardElements = this.shadow.querySelectorAll('.carousel-card');
    const dots = this.shadow.querySelectorAll('.nav-dot');
    const numberEl = this.shadow.querySelector('.progress-number');

    cardElements.forEach((card, i) => {
      const el = card as HTMLElement;
      el.classList.toggle('active', i === newIndex);

      if (i < newIndex) {
        el.style.transform = `translateY(-${(newIndex - i) * 20}px) scale(${1 - (newIndex - i) * 0.03})`;
        el.style.opacity = '0';
        el.style.zIndex = `${i}`;
      } else if (i === newIndex) {
        el.style.transform = 'translateY(0) scale(1)';
        el.style.opacity = '1';
        el.style.zIndex = `${this.cards.length}`;
      } else {
        const offset = i - newIndex;
        el.style.transform = `translateY(${offset * 16}px) scale(${1 - offset * 0.04})`;
        el.style.opacity = `${Math.max(0.3, 1 - offset * 0.3)}`;
        el.style.zIndex = `${this.cards.length - offset}`;
      }
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === newIndex);
    });

    if (numberEl) {
      numberEl.textContent = String(newIndex + 1).padStart(2, '0');
    }
  }

  private updateProgressRing(progress: number) {
    const fill = this.shadow.querySelector('.progress-ring-fill') as SVGCircleElement;
    if (!fill) return;

    const circumference = 2 * Math.PI * 22;
    const offset = circumference * (1 - progress);
    fill.style.strokeDashoffset = `${offset}`;
  }

  private updateIntroGradient(index: number) {
    const card = this.cards[index];
    if (!card) return;

    const intro = this.shadow.querySelector('.intro-title') as HTMLElement;
    if (!intro) return;

    if (card.gradientStart && card.gradientEnd) {
      intro.style.setProperty('--intro-color-start', card.gradientStart);
      intro.style.setProperty('--intro-color-end', card.gradientEnd);
    }
  }

  private renderCard(card: CarouselCard, index: number): string {
    const isActive = index === 0;
    const offset = index * 16;
    const scale = 1 - index * 0.04;
    const opacity = Math.max(0.3, 1 - index * 0.3);
    const zIndex = this.cards.length - index;
    const accentStyle = card.accentColor ? `--card-accent: ${card.accentColor};` : '';

    const tags = card.tags.map((t) => `<span class="card-tag">${t}</span>`).join('');

    return `
      <div class="carousel-card ${isActive ? 'active' : ''}"
           style="transform: translateY(${isActive ? 0 : offset}px) scale(${isActive ? 1 : scale}); opacity: ${isActive ? 1 : opacity}; z-index: ${zIndex}; ${accentStyle}">
        <div class="card-header">
          <span class="card-company">${card.company}</span>
          <h3 class="card-title">${card.title}</h3>
          <p class="card-description">${card.description}</p>
        </div>
        <div class="card-tags">${tags}</div>
      </div>
    `;
  }

  private render() {
    const cardCount = this.cards.length;
    const circumference = 2 * Math.PI * 22;

    const dots = this.cards
      .map(
        (_, i) =>
          `<button class="nav-dot ${i === 0 ? 'active' : ''}" aria-label="Card ${i + 1}"></button>`,
      )
      .join('');

    const cardsHtml = this.cards.map((card, i) => this.renderCard(card, i)).join('');

    const firstCard = this.cards[0];
    const startColor = firstCard?.gradientStart ?? 'var(--text)';
    const endColor = firstCard?.gradientEnd ?? 'var(--accent1-500)';

    this.shadow.innerHTML = `
      <div class="carousel-section" style="height: calc(100vh * ${cardCount})">
        <div class="carousel-sticky">
          <div class="intro">
            <h2 class="intro-title" style="--intro-color-start: ${startColor}; --intro-color-end: ${endColor}">${this.introTitle}</h2>
            <p class="intro-subtitle">${this.introSubtitle}</p>
            <div class="nav-dots">${dots}</div>
            <div class="progress-container">
              <svg class="progress-ring" viewBox="0 0 48 48">
                <circle class="progress-ring-bg" cx="24" cy="24" r="22" />
                <circle class="progress-ring-fill" cx="24" cy="24" r="22"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${circumference}" />
              </svg>
              <span class="progress-number">01</span>
            </div>
          </div>
          <div class="card-stack">
            ${cardsHtml}
          </div>
        </div>
      </div>
    `;

    // Dot click handlers
    this.shadow.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const section = this.shadow.querySelector('.carousel-section') as HTMLElement;
        if (!section) return;
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        const sectionHeight = section.offsetHeight - window.innerHeight;
        const targetScroll = sectionTop + (i / this.cards.length) * sectionHeight;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      });
    });
  }
}

customElements.define('jm-stacked-carousel', JmStackedCarousel);
