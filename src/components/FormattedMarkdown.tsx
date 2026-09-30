import React from 'react';
import { Sparkles, Lightbulb, Stethoscope, Bookmark, CheckCircle2 } from 'lucide-react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
  fontSize?: 'sm' | 'base' | 'lg';
}

/**
 * Clean up raw LaTeX tokens and format mathematical / chemical formulas into standard readable text.
 */
function cleanLatexAndSymbols(text: string): string {
  if (!text) return '';
  return text
    // Remove environment tags
    .replace(/\\begin\{[a-zA-Z*]+\}/g, '')
    .replace(/\\end\{[a-zA-Z*]+\}/g, '')
    // Replace \text{...}, \mathrm{...}, \mathbf{...}
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\mathit\{([^}]+)\}/g, '$1')
    // Replace fractions \frac{a}{b} with (a / b)
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    // Square roots \sqrt{x}
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    // Replace common arrows
    .replace(/\\longrightarrow/g, '→')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\to\b/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\leftrightarrow/g, '↔')
    .replace(/\\rightleftharpoons/g, '⇌')
    // Greek letters
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    // Operators & symbols
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\approx/g, '≈')
    .replace(/\\neq/g, '≠')
    .replace(/\\le\b|\\leq\b/g, '≤')
    .replace(/\\ge\b|\\geq\b/g, '≥')
    .replace(/\\infty/g, '∞')
    .replace(/\\degree|\\circ/g, '°')
    // Subscripts & Superscripts common patterns
    .replace(/\^2\b/g, '²')
    .replace(/\^3\b/g, '³')
    .replace(/\^0\b/g, '⁰')
    .replace(/\^1\b/g, '¹')
    // Clean remaining LaTeX escape backslashes e.g. \, \; \!
    .replace(/\\[,;!]/g, ' ')
    // Remove standalone $$ or $ math delimiters
    .replace(/\$\$/g, '')
    .replace(/\$/g, '');
}

/**
 * Parse inline formatting (bold, italic, inline code)
 */
function renderInlineFormatting(line: string): React.ReactNode[] {
  const cleaned = cleanLatexAndSymbols(line);

  // Regex to match **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = cleaned.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2).trim();
      return (
        <strong key={index} className="font-bold text-slate-900">
          {boldText}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      const italicText = part.slice(1, -1).trim();
      return (
        <em key={index} className="italic text-slate-700">
          {italicText}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-purple-700 text-xs font-semibold"
        >
          {codeText}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

/**
 * Clean heading titles from wrapping asterisks e.g. "## **Title**" -> "Title"
 */
function cleanHeadingTitle(text: string): string {
  let title = text.trim();
  if (title.startsWith('**') && title.endsWith('**')) {
    title = title.slice(2, -2).trim();
  }
  return title;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({
  content,
  className = '',
  fontSize = 'base',
}) => {
  if (!content) return null;

  // Split into raw lines
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let currentListItems: React.ReactNode[] = [];
  let isNumberedList = false;

  // Table parsing buffer
  let currentTableRows: string[][] = [];
  let isTable = false;

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      const headerRow = currentTableRows[0];
      const bodyRows = currentTableRows.slice(1);

      renderedElements.push(
        <div key={`tbl-${renderedElements.length}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm">
            <thead className="bg-slate-50">
              <tr>
                {headerRow.map((cell, idx) => (
                  <th key={idx} className="px-3.5 py-2.5 text-left font-bold text-slate-800">
                    {renderInlineFormatting(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-slate-700">
                      {renderInlineFormatting(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTableRows = [];
      isTable = false;
    }
  };

  const flushList = () => {
    if (currentListItems.length > 0) {
      if (isNumberedList) {
        renderedElements.push(
          <ol
            key={`list-${renderedElements.length}`}
            className="space-y-1.5 my-2.5 pl-1 list-none"
          >
            {currentListItems}
          </ol>
        );
      } else {
        renderedElements.push(
          <ul
            key={`list-${renderedElements.length}`}
            className="space-y-1.5 my-2.5 pl-1 list-none"
          >
            {currentListItems}
          </ul>
        );
      }
      currentListItems = [];
      isNumberedList = false;
    }
  };

  const flushAll = () => {
    flushList();
    flushTable();
  };

  const textSizeClass =
    fontSize === 'lg'
      ? 'text-base sm:text-lg leading-relaxed'
      : fontSize === 'sm'
      ? 'text-xs sm:text-sm leading-relaxed'
      : 'text-sm sm:text-base leading-relaxed';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushAll();
      continue;
    }

    // Markdown Table Row detection (e.g. | Cell 1 | Cell 2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      // Skip separator row like | --- | --- |
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        continue;
      }
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      if (cells.length > 0) {
        currentTableRows.push(cells);
        isTable = true;
        continue;
      }
    } else if (isTable) {
      flushTable();
    }

    // Heading 1 (#)
    if (trimmed.startsWith('# ')) {
      flushAll();
      const title = cleanHeadingTitle(trimmed.replace(/^#\s+/, ''));
      renderedElements.push(
        <div key={`h1-${i}`} className="mt-4 mb-2 pb-1.5 border-b border-purple-200">
          <h2 className="text-base sm:text-lg font-black text-purple-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <span>{renderInlineFormatting(title)}</span>
          </h2>
        </div>
      );
      continue;
    }

    // Heading 2 (##)
    if (trimmed.startsWith('## ')) {
      flushAll();
      const title = cleanHeadingTitle(trimmed.replace(/^##\s+/, ''));
      renderedElements.push(
        <div key={`h2-${i}`} className="mt-3.5 mb-1.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-purple-600 flex-shrink-0" />
            <span>{renderInlineFormatting(title)}</span>
          </h3>
        </div>
      );
      continue;
    }

    // Heading 3 (###)
    if (trimmed.startsWith('### ')) {
      flushAll();
      const title = cleanHeadingTitle(trimmed.replace(/^###\s+/, ''));
      renderedElements.push(
        <div key={`h3-${i}`} className="mt-3 mb-1">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-purple-800 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
            <span>{renderInlineFormatting(title)}</span>
          </h4>
        </div>
      );
      continue;
    }

    // Explicit Blockquote / Callout Box ONLY when line starts with '>'
    if (trimmed.startsWith('>')) {
      flushAll();
      const cleanQuote = trimmed.replace(/^>\s*/, '');
      const isTip =
        cleanQuote.toLowerCase().includes('tip') ||
        cleanQuote.toLowerCase().includes('mdcat') ||
        cleanQuote.toLowerCase().includes('doctor') ||
        cleanQuote.toLowerCase().includes('yield');

      renderedElements.push(
        <div
          key={`callout-${i}`}
          className={`my-3 p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm shadow-2xs ${
            isTip
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50/70 border-emerald-300 text-emerald-950'
              : 'bg-purple-50/80 border-purple-200 text-purple-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isTip ? (
              <Stethoscope className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Lightbulb className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium leading-relaxed">
              {renderInlineFormatting(cleanQuote)}
            </div>
          </div>
        </div>
      );
      continue;
    }

    // Numbered list item (e.g. 1. or 2. or 1) )
    const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
    if (numberedMatch) {
      flushTable();
      const num = numberedMatch[1];
      const itemText = numberedMatch[2];
      isNumberedList = true;
      currentListItems.push(
        <li key={`num-${i}`} className={`flex items-start gap-2.5 text-slate-800 ${textSizeClass}`}>
          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
            {num}
          </span>
          <div className="flex-1">{renderInlineFormatting(itemText)}</div>
        </li>
      );
      continue;
    }

    // Bullet list item (- or * or •)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)/);
    if (bulletMatch) {
      flushTable();
      const itemText = bulletMatch[1];
      isNumberedList = false;
      currentListItems.push(
        <li key={`bullet-${i}`} className={`flex items-start gap-2.5 text-slate-800 ${textSizeClass}`}>
          <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-2 shadow-2xs" />
          <div className="flex-1">{renderInlineFormatting(itemText)}</div>
        </li>
      );
      continue;
    }

    // Normal paragraph
    flushAll();
    renderedElements.push(
      <p key={`p-${i}`} className={`my-2 text-slate-800 ${textSizeClass}`}>
        {renderInlineFormatting(trimmed)}
      </p>
    );
  }

  flushAll();

  return (
    <div className={`formatted-ai-content space-y-1 ${className}`}>
      {renderedElements}
    </div>
  );
};
