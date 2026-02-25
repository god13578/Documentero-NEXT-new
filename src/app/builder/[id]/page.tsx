'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Printer, Loader2, FileText, Download } from 'lucide-react';

import DynamicFieldBuilder from '@/components/DynamicFieldBuilder';
import RealtimePreview from '@/components/RealtimePreview';
import { saveDocument } from '../actions';

export default function BuilderPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [template, setTemplate] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [formData, setFormData] = useState<any>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/templates/${id}`);
        if (res.ok) {
            const data = await res.json();
            setTemplate(data);
            const initialData: any = {};
            if (data.fields) data.fields.forEach((f: any) => initialData[f.name] = "");
            setFormData(initialData);
        }
        const htmlRes = await fetch(`/api/builder/${id}/preview-html`);
        if (htmlRes.ok) {
            const htmlData = await htmlRes.json();
            setHtmlContent(htmlData.html || htmlData.htmlTemplate || "");
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
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
        alert("✅ บันทึกเอกสารลงระบบเรียบร้อย!");
        router.push('/dashboard'); 
      } else alert(`❌ บันทึกไม่สำเร็จ: ${result.error}`);
    } catch (err) { alert("เกิดข้อผิดพลาด"); } finally { setIsSaving(false); }
  };

  const handleDownloadWord = () => {
    const dataParam = encodeURIComponent(JSON.stringify(formData));
    window.location.href = `/api/builder/${id}/generate?data=${dataParam}`;
  };

  // 🌟 แก้ระบบ PDF เป็นการเปิด "PDF ของแท้" ในแท็บใหม่
  const handlePrintPdf = () => {
    // ดึงข้อมูลที่กรอกทั้งหมดเข้ารหัส
    const dataParam = encodeURIComponent(JSON.stringify(formData));
    // เปิดหน้า API พรีวิว PDF (ของแท้) ในหน้าต่างใหม่
    window.open(`/api/builder/${id}/preview-pdf?data=${dataParam}`, '_blank');
  };

  const handlePreviewClick = (fieldName: string) => {
    setFocusedField(fieldName);
    const inputElement = document.getElementById(`input-field-${fieldName}`);
    if (inputElement) {
      inputElement.focus();
      inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) return <div className="h-screen flex justify-center items-center"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    // 🌟 พระเอกคือ print:block ที่จะปลดล็อค Flexbox ไม่ให้มันคำนวณจนค้าง
    <div className="flex flex-col h-screen bg-[#F8FAFC] font-sarabun print:block print:h-auto print:bg-white">
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-50 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20} /></Link>
          <h1 className="font-bold text-slate-800 text-lg truncate max-w-md">{template?.name || "Untitled"}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handlePrintPdf} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
            <Printer size={18} /> พิมพ์ / PDF
          </button>
          
          <button onClick={handleDownloadWord} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
            <Download size={18} /> โหลด Word
          </button>

          <button onClick={handleSave} disabled={isSaving} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            บันทึก
          </button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 flex overflow-hidden z-10 relative print:block print:overflow-visible">
        <aside className="w-[450px] bg-white border-r flex flex-col z-20 shadow-lg print:hidden">
          <div className="p-6 border-b"><h2 className="font-bold text-base">ข้อมูลเอกสาร</h2></div>
          <div className="flex-1 overflow-y-auto p-6">
            <DynamicFieldBuilder fields={template?.fields || []} value={formData} onChange={setFormData} onFocusField={setFocusedField} />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto scrollbar-thin relative bg-slate-100/80 print:block print:bg-white print:overflow-visible print:p-0 print:m-0">
          <RealtimePreview 
            htmlTemplate={htmlContent || template?.htmlTemplate || ""} 
            values={formData} 
            focusedField={focusedField} 
            onFieldClick={handlePreviewClick} 
          />
        </main>
      </div>
    </div>
  );
}