export async function getCSS(filename: string, pageUrl: string) {
  const styleSheet = new CSSStyleSheet();
  const cssPath = new URL(filename, pageUrl).href;
  const css = await fetch(cssPath).then((r) => r.text());
  styleSheet.replaceSync(css);
  return styleSheet;
}
