import React from 'react';
import fs from 'fs';
import path from 'path';
import { AlignLeft, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import HighlightClient from './HighlightClient';
import SettingsPopover from './SettingsPopover';

// Read all slugs to generate static params for fast loading
export async function generateStaticParams() {
  const indexPath = path.join(process.cwd(), 'data', 'index.json');
  if (!fs.existsSync(indexPath)) return [];
  
  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  return indexData.map((b: any) => ({
    slug: b.slug,
  }));
}

export default async function BrosurPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const contentPath = path.join(process.cwd(), 'data', 'content', `${slug}.json`);
  
  if (!fs.existsSync(contentPath)) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center text-zinc-500">
        <h2 className="text-2xl font-bold mb-4">Brosur tidak ditemukan</h2>
        <Link href="/" className="btn-apple bg-accent text-white px-6 py-3 rounded-full flex items-center gap-2">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const brosur = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full relative">
      <header className="p-6 md:p-12 pb-6 border-b border-black/5 dark:border-white/5 relative">
        <div className="absolute top-6 right-6 md:top-12 md:right-12 flex items-center gap-2">
          <SettingsPopover />
          <Link href="/" className="p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </Link>
        </div>

        <div className="flex items-center gap-2 text-accent text-sm font-bold mb-4 uppercase tracking-widest">
          <AlignLeft size={16} /> Edisi Tahun {brosur.tahun}
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
          {brosur.judul}
        </h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
        <HighlightClient brosur={brosur} />
      </div>
    </div>
  );
}
