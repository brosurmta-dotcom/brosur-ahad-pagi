'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Upload, LogOut, FileText, Loader2, CheckCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Fetch stats
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => setVisitorCount(data.uniqueVisitors))
      .catch(err => console.error(err));
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if it's CHM or ZIP
      if (file.name.endsWith('.chm') || file.name.endsWith('.zip')) {
        setSelectedFile(file);
        setUploadStatus(null);
      } else {
        setUploadStatus({ type: 'error', message: 'Hanya file .chm atau .zip yang diperbolehkan.' });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadStatus(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setUploadStatus({ type: 'success', message: 'File berhasil diunggah dan disimpan secara lokal.' });
        setSelectedFile(null);
      } else {
        setUploadStatus({ type: 'error', message: data.error || 'Gagal mengunggah file.' });
      }
    } catch (err) {
      setUploadStatus({ type: 'error', message: 'Terjadi kesalahan pada server.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 flex">
      {/* Sidebar Dashboard */}
      <aside className="w-64 border-r border-black/5 dark:border-white/5 bg-white dark:bg-black hidden md:flex flex-col">
        <div className="p-6 border-b border-black/5 dark:border-white/5">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
              <BookOpen className="text-white" size={16} />
            </div>
            <span className="font-bold text-lg tracking-tight">Admin Area</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-accent/10 text-accent rounded-xl font-bold">
            <Upload size={18} />
            Upload CHM
          </button>
          
          <div className="mt-8 px-4 pt-6 border-t border-black/5 dark:border-white/5">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Statistik</h3>
            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <Users className="text-accent" size={20} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold mb-0.5">Total Perangkat</p>
                <p className="font-extrabold text-2xl leading-none">
                  {visitorCount === null ? <Loader2 className="animate-spin text-zinc-400" size={16} /> : visitorCount}
                </p>
              </div>
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-black/5 dark:border-white/5">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <header className="mb-10">
            <h1 className="text-3xl font-extrabold mb-2">Upload File CHM</h1>
            <p className="text-zinc-500">Unggah file arsip brosur untuk memproses dan menambahkannya ke dalam database lokal.</p>
          </header>

          <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-3xl p-8 shadow-sm">
            {/* Drag & Drop Area */}
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-accent hover:bg-accent/5 transition-colors group">
              <input 
                type="file" 
                accept=".chm,.zip"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
                <Upload size={28} className="text-zinc-400 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-lg mb-1">Pilih atau letakkan file di sini</h3>
              <p className="text-sm text-zinc-500">Mendukung file berformat .chm atau .zip</p>
            </div>

            {/* Selected File Details */}
            {selectedFile && (
              <div className="mt-6 flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <FileText className="text-accent" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-zinc-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-accent text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent/90 disabled:opacity-50 transition-colors"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={16} /> : 'Mulai Upload'}
                </button>
              </div>
            )}

            {/* Upload Status */}
            {uploadStatus && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-xl flex items-center gap-3 font-medium text-sm border ${
                  uploadStatus.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                }`}
              >
                {uploadStatus.type === 'success' ? <CheckCircle size={18} /> : <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                {uploadStatus.message}
              </motion.div>
            )}
            
            <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-sm text-orange-700 dark:text-orange-400">
              <strong className="block mb-1">⚠️ Perhatian Mode Lokal:</strong>
              Karena Anda menggunakan Next.js secara lokal, file yang diunggah akan disimpan di folder <code>chm-uploads/</code> pada komputer Anda. Fitur ini tidak akan berfungsi jika Anda menggunakan Vercel tanpa menghubungkan Storage (Database) eksternal.
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
