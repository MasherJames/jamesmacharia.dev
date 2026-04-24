import { JmBase } from '../base';
import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

enum ThemeOptions {
  LIGHT = 'light',
  DARK = 'dark',
}

const THEME_STORAGE_KEY = 'theme';

export class JmThemeSwitcher extends JmBase {
  private theme: ThemeOptions = ThemeOptions.LIGHT;
  private systemPreferenceHandler: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    super(styles);
  }

  connectedCallback() {
    this.theme = this.getColorPreference();
    this.render();
    this.applyThemeToDocument();
    this.listenToSystemPreference();
  }

  disconnectedCallback() {
    if (this.systemPreferenceHandler) {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', this.systemPreferenceHandler);
    }
  }

  private getColorPreference(): ThemeOptions {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeOptions;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? ThemeOptions.DARK
      : ThemeOptions.LIGHT;
  }

  private applyThemeToDocument() {
    const root = document.firstElementChild;
    if (!root) return;

    const oldTheme = this.theme === ThemeOptions.LIGHT ? ThemeOptions.DARK : ThemeOptions.LIGHT;

    root.classList.remove(oldTheme);
    root.classList.add(this.theme);
  }

  private listenToSystemPreference() {
    this.systemPreferenceHandler = ({ matches: isDark }: MediaQueryListEvent) => {
      const systemTheme = isDark ? ThemeOptions.DARK : ThemeOptions.LIGHT;
      localStorage.setItem(THEME_STORAGE_KEY, systemTheme);
      this.theme = systemTheme;
      this.applyThemeToDocument();
      this.render();
    };

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', this.systemPreferenceHandler);
  }

  private handleThemeChange = () => {
    this.theme = this.theme === ThemeOptions.LIGHT ? ThemeOptions.DARK : ThemeOptions.LIGHT;
    localStorage.setItem(THEME_STORAGE_KEY, this.theme);
    this.applyThemeToDocument();
    this.updateIcons();
  };

  private updateIcons() {
    const sun = this.shadow.querySelector('.light');
    const moon = this.shadow.querySelector('.dark');
    if (!sun || !moon) return;

    sun.classList.toggle('active', this.theme === ThemeOptions.LIGHT);
    moon.classList.toggle('active', this.theme === ThemeOptions.DARK);
  }

  private render() {
    const lightActive = this.theme === ThemeOptions.LIGHT ? 'active' : '';
    const darkActive = this.theme === ThemeOptions.DARK ? 'active' : '';

    this.shadow.innerHTML = `
      <button class="themeswitcher" aria-label="Toggle theme">
        <svg class="light ${lightActive}" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm6.364-2.05.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 1.414-1.414Zm-12.728 0a1 1 0 0 1 1.497 1.32l-.083.094-.707.707a1 1 0 0 1-1.497-1.32l.083-.094.707-.707ZM12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-8 3a1 1 0 0 1 .117 1.993L4 13H3a1 1 0 0 1-.117-1.993L3 11h1Zm17 0a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1ZM4.929 4.929a1 1 0 0 1 1.32-.083l.094.083.707.707a1 1 0 0 1-1.32 1.497l-.094-.083-.707-.707a1 1 0 0 1 0-1.414Zm14.142 0a1 1 0 0 1 0 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0ZM12 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Z" fill="currentColor"/>
        </svg>
        <svg class="dark ${darkActive}" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.574 3.137c-.79-.14-1.432.662-1.097 1.409a6 6 0 0 1-7.931 7.931 1.01 1.01 0 0 0-1.409 1.097A9 9 0 0 0 21 12c0-4.434-3.206-8.118-7.426-8.863Zm1.307 2.481A7.002 7.002 0 0 1 12 19a7.002 7.002 0 0 1-6.382-4.12 8 8 0 0 0 9.263-9.263Z" fill="currentColor"/>
        </svg>
      </button>
    `;

    this.shadow.querySelector('button')?.addEventListener('click', this.handleThemeChange);
  }
}

customElements.define('jm-theme-switcher', JmThemeSwitcher);
