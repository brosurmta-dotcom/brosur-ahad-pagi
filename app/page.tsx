import React from 'react';
import { BookOpen, FolderArchive, ArrowRight } from "lucide-react";
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export default function Home() {
  // Try to find the latest brosur slug to use as the entry point for the Brosur Ahad Pagi collection
  let entrySlug = '';
  try {
    const indexPath = path.join(process.cwd(), 'data', 'index.json');
    if (fs.existsSync(indexPath)) {
      const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      if (indexData.length > 0) {
        entrySlug = indexData[0].slug;
      }
    }
  } catch (e) {
    // ignore
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 flex flex-col">
      <header className="p-6 md:p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <FolderArchive className="text-white" size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight">Koleksi Digital</span>
        </div>
        <Link href="/login" className="text-sm font-bold text-zinc-500 hover:text-accent transition-colors">
          Admin Login
        </Link>
      </header>

      <main className="flex-1 p-8 md:p-12 max-w-6xl mx-auto w-full">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Perpustakaan CHM</h1>
          <p className="text-zinc-500 max-w-2xl mx-auto md:mx-0">
            Silakan pilih koleksi arsip yang ingin Anda baca di bawah ini. Nantinya, semua file CHM yang Anda unggah akan muncul sebagai kartu koleksi di halaman ini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card for Brosur Ahad Pagi */}
          {entrySlug ? (
            <Link href={`/${entrySlug}`} className="group relative bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30 transition-all duration-300 flex flex-col h-full overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                <BookOpen size={100} />
              </div>
              
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                <BookOpen size={28} className="text-accent group-hover:text-white transition-colors" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Brosur Ahad Pagi</h2>
              <p className="text-zinc-500 text-sm mb-8 flex-1">
                Koleksi lengkap arsip digital Brosur Ahad Pagi (1995-2022). Telah diindeks secara penuh untuk memudahkan pencarian teks dan tema kajian.
              </p>
              
              <div className="flex items-center text-accent font-bold text-sm gap-2 mt-auto">
                Mulai Membaca <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center h-64 text-zinc-500">
              <BookOpen size={32} className="mb-4 opacity-50" />
              <p>Belum ada data brosur yang diekstrak.</p>
            </div>
          )}
          
          {/* Placeholder for future uploads */}
          <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px] text-zinc-400 dark:text-zinc-600">
            <FolderArchive size={32} className="mb-4" />
            <h3 className="font-bold text-lg mb-1">Koleksi Baru</h3>
            <p className="text-sm max-w-[200px]">Koleksi CHM lain yang Anda unggah akan muncul di sini nantinya.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
