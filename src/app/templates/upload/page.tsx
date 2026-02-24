'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name);

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        // อัปโหลดเสร็จ กลับไปหน้า Dashboard ทันที
        router.push('/dashboard');
        router.refresh(); // บังคับรีเฟรชข้อมูล
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sarabun">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-100 p-8">
        
        <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">เพิ่มแม่แบบใหม่</h1>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* File Input Zone */}
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer group">
            <input 
              type="file" 
              accept=".docx"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                    // Auto set name from filename if empty
                    if(!name) setName(e.target.files[0].name.replace('.docx', ''));
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-full transition-colors ${file ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:text-blue-500'}`}>
                {file ? <FileText size={32}/> : <UploadCloud size={32} />}
              </div>
              <div>
                <p className="font-bold text-slate-700 text-lg">
                    {file ? file.name : "คลิกเพื่อเลือกไฟล์ .docx"}
                </p>
                {!file && <p className="text-slate-400 text-sm mt-1">หรือลากไฟล์มาวางที่นี่</p>}
              </div>
            </div>
          </div>

          {/* Template Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">ชื่อแม่แบบเอกสาร</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น หนังสือเชิญประชุม..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={20} />}
            {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดแม่แบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}