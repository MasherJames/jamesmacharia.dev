import css from './index.css?inline';

const baseStyles = new CSSStyleSheet();
baseStyles.replaceSync(css);

export class JmBase extends HTMLElement {
  protected shadow: ShadowRoot;

  constructor(componentStyles?: CSSStyleSheet) {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    const sheets: CSSStyleSheet[] = [baseStyles];
    if (componentStyles) {
      sheets.push(componentStyles);
    }
    this.shadow.adoptedStyleSheets = sheets;
  }
}
