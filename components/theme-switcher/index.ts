import css from './index.css?inline';

const styles = new CSSStyleSheet();
styles.replaceSync(css);

enum ThemeOptions {
  LIGHT = 'light',
  DARK = 'dark',
}

const THEME_STORAGE_KEY = 'theme';

export class JmThemeSwitcher extends HTMLElement {
  static observedAttributes = ['sprite', 'dark-target', 'light-target', 'sun-color', 'moon-color'];

  private shadow: ShadowRoot;
  private theme: ThemeOptions = ThemeOptions.LIGHT;
  private systemPreferenceHandler: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.adoptedStyleSheets = [styles];
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

  attributeChangedCallback() {
    this.render();
  }

  private get sprite(): string {
    return this.getAttribute('sprite') ?? '';
  }

  private get darkTarget(): string {
    return this.getAttribute('dark-target') ?? 'dark';
  }

  private get lightTarget(): string {
    return this.getAttribute('light-target') ?? 'light';
  }

  private get sunColor(): string {
    return this.getAttribute('sun-color') ?? 'secondary';
  }

  private get moonColor(): string {
    return this.getAttribute('moon-color') ?? 'accent1';
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
    this.render();
  };

  private render() {
    const lightActive = this.theme === ThemeOptions.LIGHT ? 'active' : '';
    const darkActive = this.theme === ThemeOptions.DARK ? 'active' : '';

    this.shadow.innerHTML = `
            <button class="themeswitcher" aria-label="Toggle theme">
                <svg
                    class="light ${lightActive}"
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <use href="${this.sprite}#${this.lightTarget}" stroke-width="2px" class="x-${this.sunColor}"></use>
                </svg>
                <svg
                    class="dark ${darkActive}"
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <use href="${this.sprite}#${this.darkTarget}" stroke-width="2px" class="x-${this.moonColor}"></use>
                </svg>
            </button>
        `;

    this.shadow.querySelector('button')?.addEventListener('click', this.handleThemeChange);
  }
}

customElements.define('jm-theme-switcher', JmThemeSwitcher);
