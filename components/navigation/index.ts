import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

interface NavItem {
  label: string;
  href: string;
  id: string;
  opensInNewTab?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'About', href: '/about/', id: 'about' },
  { label: 'Services', href: '/services/', id: 'services' },
  { label: 'Writing', href: '/writing/', id: 'writing' },
  { label: 'Contact', href: '/contact/', id: 'contact' },
  { label: 'Resume', href: '/resume.pdf', id: 'resume', opensInNewTab: true },
];

const MOBILE_BREAKPOINT = 768;

export class JmNavigation extends JmBase {
  private boundScrollHandler = this.handleScroll.bind(this);
  private boundKeyHandler = this.handleKey.bind(this);
  private boundResizeHandler = this.handleResize.bind(this);
  private boundOutsideClickHandler = this.handleOutsideClick.bind(this);
  private navResizeObserver: ResizeObserver | null = null;

  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.render();
    window.addEventListener('scroll', this.boundScrollHandler, { passive: true });
    window.addEventListener('keydown', this.boundKeyHandler);
    window.addEventListener('resize', this.boundResizeHandler, { passive: true });
    document.addEventListener('click', this.boundOutsideClickHandler);
    this.updateNavHeight();
    requestAnimationFrame(() => this.updateNavHeight());
    const nav = this.shadow.querySelector('nav');
    if (nav && 'ResizeObserver' in window) {
      this.navResizeObserver = new ResizeObserver(() => this.updateNavHeight());
      this.navResizeObserver.observe(nav);
    }
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.boundScrollHandler);
    window.removeEventListener('keydown', this.boundKeyHandler);
    window.removeEventListener('resize', this.boundResizeHandler);
    document.removeEventListener('click', this.boundOutsideClickHandler);
    this.navResizeObserver?.disconnect();
    this.navResizeObserver = null;
  }

  private handleScroll() {
    const img = this.shadow.querySelector('.logo-image') as HTMLElement;
    if (!img) return;
    const deg = (window.scrollY / document.documentElement.scrollHeight) * 720;
    img.style.transform = `rotate(${deg}deg)`;
  }

  private handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.hasAttribute('open')) {
      this.close();
    }
  }

  private handleResize() {
    if (window.innerWidth > MOBILE_BREAKPOINT && this.hasAttribute('open')) {
      this.close();
    }
    this.updateNavHeight();
  }

  private handleOutsideClick(e: MouseEvent) {
    if (!this.hasAttribute('open')) return;
    const path = e.composedPath();
    if (!path.includes(this)) this.close();
  }

  private updateNavHeight() {
    const nav = this.shadow.querySelector('nav') as HTMLElement | null;
    if (!nav) return;
    const h = nav.offsetHeight;
    (this as HTMLElement).style.setProperty('--nav-height', `${h}px`);
    nav.style.setProperty('--nav-height', `${h}px`);
  }

  private open() {
    this.setAttribute('open', '');
    const toggle = this.shadow.querySelector('.nav-toggle') as HTMLElement | null;
    toggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  private close() {
    this.removeAttribute('open');
    const toggle = this.shadow.querySelector('.nav-toggle') as HTMLElement | null;
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  private toggle() {
    if (this.hasAttribute('open')) {
      this.close();
    } else {
      this.open();
    }
  }

  private get activePage(): string {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') return 'home';
    for (const item of NAV_ITEMS) {
      if (item.id !== 'home' && path.startsWith(`/${item.id}`)) return item.id;
    }
    return '';
  }

  private renderNavLink(item: NavItem): string {
    const isActive = this.activePage === item.id;
    const newTabAttributes = item.opensInNewTab
      ? ` target="_blank" rel="noopener" aria-label="${item.label} (opens in a new tab)"`
      : '';
    return `
      <li class="nav-link ${isActive ? 'active' : ''}">
        <a href="${item.href}"${isActive ? ' aria-current="page"' : ''}${newTabAttributes}>${item.label}</a>
        <svg viewBox="0 0 120 44" preserveAspectRatio="none" aria-hidden="true">
          <ellipse cx="60" cy="22" rx="55" ry="18" />
        </svg>
      </li>
    `;
  }

  private render() {
    this.shadow.innerHTML = `
      <nav aria-label="Primary">
        <a class="nav-logo" href="/">
          <img class="logo-image" src="/images/Profile-256.webp" alt="" width="32" height="32" fetchpriority="high" decoding="async" />
          <span class="logo-name">James Macharia</span>
        </a>
        <ul class="nav-links" id="primary-menu">
          ${NAV_ITEMS.map((item) => this.renderNavLink(item)).join('')}
        </ul>
        <div class="nav-actions">
          <jm-theme-switcher></jm-theme-switcher>
          <button
            class="nav-toggle"
            type="button"
            aria-label="Toggle menu"
            aria-expanded="false"
            aria-controls="primary-menu"
          >
            <span class="bars" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
        <div class="nav-scrim" aria-hidden="true"></div>
      </nav>
    `;

    const toggle = this.shadow.querySelector('.nav-toggle');
    toggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this.shadow.querySelectorAll<HTMLAnchorElement>('.nav-link a').forEach((a) => {
      a.addEventListener('click', () => this.close());
    });

    const scrim = this.shadow.querySelector('.nav-scrim');
    scrim?.addEventListener('click', () => this.close());
  }
}

customElements.define('jm-navigation', JmNavigation);
