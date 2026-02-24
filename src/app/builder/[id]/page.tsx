'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Printer, Loader2, FileText } from 'lucide-react';

import DynamicFieldBuilder from '@/components/DynamicFieldBuilder';
import RealtimePreview from '@/components/RealtimePreview';
import PdfPreview from '@/components/PdfPreview';
import { saveDocument } from '../actions';

export default function BuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [template, setTemplate] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState<string>(""); // เพิ่มตัวแปรเก็บ HTML
  const [formData, setFormData] = useState<any>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'html' | 'pdf'>('html');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // โหลดข้อมูล Template และ HTML
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. โหลดข้อมูลช่องกรอก (Fields)
        const res = await fetch(`/api/templates/${id}`);
        if (res.ok) {
            const data = await res.json();
            setTemplate(data);
            
            const initialData: any = {};
            if (data.fields && Array.isArray(data.fields)) {
              data.fields.forEach((f: any) => initialData[f.name] = "");
            }
            setFormData(initialData);
        }

        // 2. โหลดภาพ Preview (HTML) - นี่คือส่วนที่หายไป!
        const htmlRes = await fetch(`/api/builder/${id}/preview-html`);
        if (htmlRes.ok) {
            const htmlData = await htmlRes.json();
            // รองรับทั้งแบบเก่าและใหม่
            setHtmlContent(htmlData.html || htmlData.htmlTemplate || htmlData.content || "");
        }
      } catch (err) { 
        console.error("Fetch error:", err); 
      } finally { 
        setLoading(false); 
      }
    }
    if (id) fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!template) return;
    setIsSaving(true);
    try {
      const docName = `${template.name} - ${new Date().toLocaleString('th-TH')}`;
      const result = await saveDocument(id as string, formData, docName);
      if (result.success) {
        alert("✅ บันทึกเอกสารเรียบร้อย!");
        router.push('/dashboard'); 
      } else {
        alert(`❌ บันทึกไม่สำเร็จ: ${result.error}`);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-3">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">กำลังเตรียมระบบพรีวิว...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC] font-sarabun relative">
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>

      {/* HEADER */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-6 w-px bg-slate-200"></div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight truncate max-w-md flex items-center gap-2">
              {template?.name || "Untitled Document"}
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Preview Ready
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
            <button onClick={() => setViewMode('html')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'html' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>
              <Eye size={16} /> <span className="hidden sm:inline">กรอกข้อมูล</span>
            </button>
            <button onClick={() => setViewMode('pdf')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'pdf' ? 'bg-white text-red-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}`}>
              <Printer size={16} /> <span className="hidden sm:inline">ดู PDF</span>
            </button>
          </div>

          <button onClick={handleSave} disabled={isSaving} className={`text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95 ${isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-300'}`}>
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกเอกสาร'}
          </button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden z-10 relative">
        {/* Left: Form */}
        <aside className="w-[450px] bg-white/80 backdrop-blur-sm border-r border-slate-200 flex flex-col z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100"><FileText size={18} /></div>
            <div><h2 className="text-slate-800 font-bold text-base">ข้อมูลเอกสาร</h2></div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
            <DynamicFieldBuilder fields={template?.fields || []} value={formData} onChange={setFormData} onFocusField={setFocusedField} />
          </div>
        </aside>

        {/* Right: Preview */}
        <main className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100/50 scrollbar-thin relative">
          <div className="w-full max-w-[210mm] transition-all duration-300 pb-20">
            {viewMode === 'html' ? (
              <RealtimePreview 
                // ดึง htmlContent มาใช้ ถ้าไม่มีใช้ของ template ถ้าไม่มีอีก ปล่อยว่าง
                htmlTemplate={htmlContent || template?.htmlTemplate || ""} 
                values={formData} 
                focusedField={focusedField} 
              />
            ) : (
              <PdfPreview templateId={id as string} values={formData} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}