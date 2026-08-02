/**
 * Mobile & Cross-Browser Compatibility Utility
 * Provides safe UUID generation and clipboard access across Android Chrome,
 * WebViews, tablets, and non-secure HTTP contexts.
 */

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback if browser security context restricts randomUUID
    }
  }

  // Mobile & Legacy Browser Fallback Generator
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 11);
  return `id_${timestamp}_${randomStr}`;
}

export function safeCopyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    // 1. Try modern navigator.clipboard API if available (Secure Context / HTTPS)
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard
        .writeText(text)
        .then(() => resolve(true))
        .catch(() => resolve(fallbackCopyText(text)));
      return;
    }

    // 2. Fallback for Mobile WebViews & HTTP LAN contexts using DOM execCommand
    resolve(fallbackCopyText(text));
  });
}

function fallbackCopyText(text: string): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Prevent scrolling or zooming on Mobile devices
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.warn('Fallback copy to clipboard failed:', err);
    return false;
  }
}
