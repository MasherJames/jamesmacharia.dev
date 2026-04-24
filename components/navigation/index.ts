import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

interface NavItem {
  label: string;
  href: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'About', href: '/about/', id: 'about' },
  { label: 'Services', href: '/services/', id: 'services' },
  { label: 'Writing', href: '/writing/', id: 'writing' },
  { label: 'Contact', href: '/contact/', id: 'contact' },
];

export class JmNavigation extends JmBase {
  private boundScrollHandler = this.handleScroll.bind(this);

  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.render();
    window.addEventListener('scroll', this.boundScrollHandler, { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.boundScrollHandler);
  }

  private handleScroll() {
    const img = this.shadow.querySelector('.logo-image') as HTMLElement;
    if (!img) return;
    const deg = (window.scrollY / document.documentElement.scrollHeight) * 720;
    img.style.transform = `rotate(${deg}deg)`;
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
    return `
      <li class="nav-link ${isActive ? 'active' : ''}">
        <a href="${item.href}">${item.label}</a>
        <svg viewBox="0 0 120 44" preserveAspectRatio="none">
          <ellipse cx="60" cy="22" rx="55" ry="18" />
        </svg>
      </li>
    `;
  }

  private render() {
    this.shadow.innerHTML = `
      <nav>
        <a class="nav-logo" href="/">
          <img class="logo-image" src="/images/Profile.webp" alt="James Macharia" width="32" height="32" />
          <span class="logo-name">James Macharia</span>
        </a>
        <ul class="nav-links">
          ${NAV_ITEMS.map((item) => this.renderNavLink(item)).join('')}
        </ul>
        <div class="nav-actions">
          <jm-theme-switcher></jm-theme-switcher>
        </div>
      </nav>
    `;
  }
}

customElements.define('jm-navigation', JmNavigation);
