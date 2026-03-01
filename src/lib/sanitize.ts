/**
 * Markdown content sanitization utilities.
 *
 * Sanitizes HTML in markdown content to prevent XSS attacks while
 * preserving common markdown features and safe HTML.
 */

import sanitizeHtml from 'sanitize-html';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Sanitization options for markdown content.
 *
 * We allow a generous set of HTML elements commonly used in markdown,
 * but strip all JavaScript-related attributes and dangerous protocols.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  // Allowed HTML elements (commonly used in markdown)
  allowedTags: [
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Text formatting
    'p', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins',
    'sup', 'sub', 'mark',
    // Lists
    'ul', 'ol', 'li',
    // Links and media
    'a', 'img',
    // Code
    'code', 'pre', 'kbd', 'samp', 'var',
    // Quotes and citations
    'blockquote', 'q', 'cite',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    // Structural
    'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main',
    // Definition lists
    'dl', 'dt', 'dd',
    // Details/Summary
    'details', 'summary',
    // Figures
    'figure', 'figcaption',
    // Other common elements
    'abbr', 'address', 'time', 'wbr',
  ],

  // Disallowed tags to completely remove (including content)
  disallowedTagsMode: 'discard',

  // Allowed attributes per element
  allowedAttributes: {
    // Global attributes on any element
    '*': ['id', 'class', 'title', 'lang', 'dir', 'data-*'],

    // Links
    a: ['href', 'target', 'rel', 'title'],

    // Images
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],

    // Tables
    th: ['colspan', 'rowspan', 'scope', 'abbr'],
    td: ['colspan', 'rowspan'],
    col: ['span'],
    colgroup: ['span'],

    // Code blocks (for syntax highlighting)
    code: ['class'],
    pre: ['class'],

    // Time
    time: ['datetime'],

    // Details
    details: ['open'],

    // Abbr
    abbr: ['title'],

    // Ordered lists
    ol: ['start', 'type', 'reversed'],
    li: ['value'],

    // Blockquote
    blockquote: ['cite'],

    // Q element
    q: ['cite'],
  },

  // Allowed URL schemes (no javascript:, data:, vbscript:, etc.)
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],

  // For img src, also allow data: URLs for inline images (common in markdown)
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },

  // Transform certain tags
  transformTags: {
    // Ensure all links open safely in new tab with noopener
    a: (tagName: string, attribs: sanitizeHtml.Attributes): sanitizeHtml.Tag => {
      const href = attribs.href || '';

      // Block javascript: URLs that might slip through
      if (href.toLowerCase().trim().startsWith('javascript:')) {
        return {
          tagName: 'span',
          attribs: { class: 'blocked-link' },
        };
      }

      // Build new attributes, keeping existing ones
      const newAttribs: sanitizeHtml.Attributes = { ...attribs };
      newAttribs.rel = 'noopener noreferrer';
      if (href.startsWith('http')) {
        newAttribs.target = '_blank';
      }

      return {
        tagName,
        attribs: newAttribs,
      };
    },
  },

  // Don't allow any custom CSS (style attribute)
  allowedStyles: {},

  // Strip script and style tags completely
  exclusiveFilter: (frame) => {
    return frame.tag === 'script' || frame.tag === 'style';
  },
};

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Content validation errors.
 */
export interface ContentValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Patterns that indicate potentially malicious content.
 * We check for these to warn (not necessarily block).
 */
const SUSPICIOUS_PATTERNS = [
  // Event handlers in various forms
  /\bon\w+\s*=/gi,
  // JavaScript protocol
  /javascript\s*:/gi,
  // VBScript protocol
  /vbscript\s*:/gi,
  // Expression in CSS (IE)
  /expression\s*\(/gi,
  // Data URLs with script MIME types
  /data\s*:\s*text\/html/gi,
  // Script tags
  /<script[\s>]/gi,
];

/**
 * Validate markdown content.
 *
 * Checks for:
 * - Empty content
 * - Size limits
 * - Suspicious patterns (returns warnings, not errors)
 */
export function validateMarkdown(content: string): ContentValidationResult {
  const warnings: string[] = [];

  // Check for empty content
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content is required' };
  }

  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Content cannot be empty' };
  }

  // Check size (1MB limit)
  const sizeBytes = new TextEncoder().encode(content).length;
  if (sizeBytes > 1_000_000) {
    return {
      valid: false,
      error: `Content size (${Math.round(sizeBytes / 1024)}KB) exceeds maximum (1MB)`,
    };
  }

  // Check for suspicious patterns (warn but don't block)
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      warnings.push(
        `Content contains potentially unsafe patterns that will be sanitized`
      );
      break; // One warning is enough
    }
  }

  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// =============================================================================
// SANITIZATION
// =============================================================================

/**
 * Sanitize markdown content.
 *
 * Removes or neutralizes:
 * - Script tags
 * - Event handlers (onclick, onerror, etc.)
 * - JavaScript/VBScript URLs
 * - Style tags (but preserves inline classes)
 * - Dangerous HTML attributes
 *
 * Preserves:
 * - All common markdown elements
 * - Safe HTML tags
 * - Code blocks (content is escaped, not executed)
 * - Images with data: URLs
 * - External links (with rel="noopener")
 */
export function sanitizeMarkdown(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Run through sanitize-html
  return sanitizeHtml(content, SANITIZE_OPTIONS);
}

/**
 * Validate and sanitize markdown content.
 *
 * Returns the sanitized content if valid, or throws an error.
 * Also returns any warnings generated during validation.
 */
export function processMarkdown(content: string): {
  content: string;
  warnings?: string[];
} {
  // Validate first
  const validation = validateMarkdown(content);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Sanitize
  const sanitized = sanitizeMarkdown(content);

  return {
    content: sanitized,
    warnings: validation.warnings,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  validateMarkdown,
  sanitizeMarkdown,
  processMarkdown,
};
