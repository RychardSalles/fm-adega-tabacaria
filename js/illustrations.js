// Placeholder neutro (sem ilustração de vitrine, sem foto de banco de imagens) usado
// só enquanto um produto ainda não tem foto real cadastrada pelo painel administrativo.
const PRODUCT_PLACEHOLDER_ICON = `
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">
    <rect x="5" y="9" width="38" height="30" rx="3"/>
    <circle cx="17" cy="19" r="3.4"/>
    <path d="M5 33 L18 22 L27 30 L36 22 L43 30"/>
  </svg>`;

function categoryIllustration() {
  return PRODUCT_PLACEHOLDER_ICON;
}
