import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isPrintMode?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  isPrintMode = false
}) => {
  if (!content) return null;

  // Function to format inline markdown like **bold**, *italic*, and `code`
  const renderFormattedText = (text: string) => {
    // Strip surrounding ** inside header tags if needed
    let processed = text;
    
    // Split by markdown inline syntax
    const parts: (string | JSX.Element)[] = [];
    let currentIndex = 0;
    
    // Pattern to match **bold**, *italic*, `code`
    const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g;
    let match: RegExpExecArray | null;

    let keyIdx = 0;
    while ((match = regex.exec(processed)) !== null) {
      // Push string before match
      if (match.index > currentIndex) {
        parts.push(processed.substring(currentIndex, match.index));
      }

      if (match[2] !== undefined) {
        // **bold**
        parts.push(
          <strong key={keyIdx++} className={isPrintMode ? 'font-bold text-slate-900' : 'font-bold text-slate-100'}>
            {match[2]}
          </strong>
        );
      } else if (match[3] !== undefined) {
        // *italic*
        parts.push(
          <em key={keyIdx++} className="italic">
            {match[3]}
          </em>
        );
      } else if (match[4] !== undefined) {
        // `code`
        parts.push(
          <code
            key={keyIdx++}
            className={
              isPrintMode
                ? 'bg-slate-100 text-slate-900 px-1 py-0.5 rounded font-mono text-[11px]'
                : 'bg-slate-800 text-indigo-300 px-1 py-0.5 rounded font-mono text-[11px]'
            }
          >
            {match[4]}
          </code>
        );
      }

      currentIndex = regex.lastIndex;
    }

    if (currentIndex < processed.length) {
      parts.push(processed.substring(currentIndex));
    }

    return parts.length > 0 ? parts : processed;
  };

  const lines = content.split('\n');
  const elements: JSX.Element[] = [];

  let inList = false;
  let listItems: JSX.Element[] = [];

  const flushList = (keyPrefix: number) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${keyPrefix}`} className="list-disc list-inside space-y-1 my-2 pl-2">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList(index);
      return;
    }

    // Horizontal Rule: --- or ***
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList(index);
      elements.push(
        <hr
          key={`hr-${index}`}
          className={isPrintMode ? 'my-4 border-slate-300' : 'my-4 border-slate-800'}
        />
      );
      return;
    }

    // Headers
    if (trimmed.startsWith('# ')) {
      flushList(index);
      const title = trimmed.replace(/^#\s+/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <h1
          key={`h1-${index}`}
          className={`text-xl font-extrabold font-outfit mt-4 mb-2 pb-1 border-b ${
            isPrintMode ? 'text-slate-900 border-slate-300' : 'text-white border-slate-800'
          }`}
        >
          {renderFormattedText(title)}
        </h1>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList(index);
      const title = trimmed.replace(/^##\s+/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <h2
          key={`h2-${index}`}
          className={`text-lg font-bold font-outfit mt-4 mb-2 ${
            isPrintMode ? 'text-slate-900' : 'text-indigo-300'
          }`}
        >
          {renderFormattedText(title)}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList(index);
      const title = trimmed.replace(/^###\s+/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <h3
          key={`h3-${index}`}
          className={`text-base font-bold font-outfit mt-3 mb-1.5 ${
            isPrintMode ? 'text-slate-900 border-b border-slate-200 pb-1' : 'text-slate-100'
          }`}
        >
          {renderFormattedText(title)}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('#### ')) {
      flushList(index);
      const title = trimmed.replace(/^####\s+/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      elements.push(
        <h4
          key={`h4-${index}`}
          className={`text-xs font-bold uppercase tracking-wider mt-3 mb-1 ${
            isPrintMode ? 'text-slate-800' : 'text-indigo-400'
          }`}
        >
          {renderFormattedText(title)}
        </h4>
      );
      return;
    }

    // List items: * or -
    if (/^[-*•]\s+/.test(trimmed)) {
      inList = true;
      const itemContent = trimmed.replace(/^[-*•]\s+/, '');
      listItems.push(
        <li key={`li-${index}`} className={`text-xs leading-relaxed ${isPrintMode ? 'text-slate-800' : 'text-slate-200'}`}>
          {renderFormattedText(itemContent)}
        </li>
      );
      return;
    }

    // Normal paragraph
    flushList(index);
    elements.push(
      <p key={`p-${index}`} className={`text-xs leading-relaxed my-1.5 ${isPrintMode ? 'text-slate-800' : 'text-slate-300'}`}>
        {renderFormattedText(trimmed)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
