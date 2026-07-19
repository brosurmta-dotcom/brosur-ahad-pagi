'use client';

import React, { useEffect, useRef, useState } from 'react';
import Mark from 'mark.js';
import { useSearchParams } from 'next/navigation';
import { Copy, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../SettingsContext';

interface BrosurData {
  slug: string;
  judul: string;
  tahun: number;
  konten: string;
}

export default function HighlightClient({ brosur }: { brosur: BrosurData }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [copied, setCopied] = useState(false);
  const { latinFontSize, arabicFontSize, latinFontFamily, arabicFontFamily } = useSettings();

  useEffect(() => {
    if (contentRef.current && query) {
      const markInstance = new Mark(contentRef.current);
      // Unmark any previous highlights
      markInstance.unmark({
        done: () => {
          // Mark the new query
          markInstance.mark(query, {
            className: 'bg-yellow-300 dark:bg-yellow-500/80 text-black px-1 rounded-sm shadow-sm',
            accuracy: 'partially',
            separateWordSearch: true,
          });
          
          // Optionally, scroll to the first highlight
          setTimeout(() => {
            const firstHighlight = contentRef.current?.querySelector('mark');
            if (firstHighlight) {
              firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }
      });
    }
  }, [query, brosur.konten]);

  const handleCopyText = () => {
    if (contentRef.current) {
      const text = contentRef.current.innerText;
      
      // Parse date from slug if possible, or just use the title
      // Slug format: BAP-(Brosur-Ahad-Pagi)-YYYY-MM-DD-judul
      const slugParts = brosur.slug.split('-');
      let dateString = '';
      if (slugParts.length >= 7) {
        dateString = `${slugParts[4]}-${slugParts[5]}-${slugParts[6]}`;
      } else {
        dateString = brosur.tahun.toString();
      }

      const signature = `\n\n---\nBAP (Brosur Ahad Pagi) - ${dateString} - ${brosur.judul}\nLink: ${window.location.origin}/${brosur.slug}`;
      const finalCopy = text + signature;
      
      navigator.clipboard.writeText(finalCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute top-0 right-0 z-10 flex gap-2">
        <button 
          onClick={handleCopyText}
          className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-accent text-white hover:bg-accent/80 transition-all opacity-90 hover:opacity-100 shadow-md"
          title="Copy seluruh teks beserta sumber"
        >
          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          {copied ? 'Teks Disalin!' : 'Copy Teks'}
        </button>
      </div>
      <article 
        ref={contentRef}
        className={`prose dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-accent reader-content font-${latinFontFamily}`}
        style={{
          '--base-font-size': `${latinFontSize}px`,
          '--arabic-font-size': `${arabicFontSize}px`,
          '--arabic-font-family': arabicFontFamily === 'amiri' ? "var(--font-amiri), serif" : "'Traditional Arabic', serif",
        } as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: brosur.konten }}
      />
    </div>
  );
}
