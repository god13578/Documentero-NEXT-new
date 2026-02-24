import React from 'react';
import { db } from '@/lib/db/client';
import { templates, documents } from '@/lib/db/schema';
import { desc, sql, eq } from 'drizzle-orm';
import Link from 'next/link';
import { FileText, Plus, History, FileDown, Layout, Trash2, FileEdit } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. ดึงข้อมูลจริงจาก DB
  const templateList = await db.select().from(templates).orderBy(desc(templates.createdAt));
  const recentDocs = await db.query.documents.findMany({
    orderBy: [desc(documents.createdAt)],
    limit: 5,
    with: { template: true }
  });

  const docCount = await db.select({ count: sql<number>`count(*)` }).from(documents);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sarabun text-slate-800 pb-20">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Layout size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none text-slate-900">Documentero NEXT</h1>
            <p className="text-xs text-slate-500 mt-1">ระบบสารบรรณอิเล็กทรอนิกส์ (V.3 Final)</p>
          </div>
        </div>
        <Link href="/templates/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md flex items-center gap-2 text-sm font-bold transition-all active:scale-95">
            <Plus size={18} /> เพิ่มแม่แบบใหม่
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-10">
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Layout size={32} />
            </div>
            <div>
              <p className="text-slate-500 font-medium">แม่แบบในระบบ</p>
              <h2 className="text-4xl font-bold text-slate-800">{templateList.length} <span className="text-lg font-normal text-slate-400">ฉบับ</span></h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FileText size={32} />
            </div>
            <div>
              <p className="text-slate-500 font-medium">เอกสารที่สร้างแล้ว</p>
              <h2 className="text-4xl font-bold text-slate-800">{Number(docCount[0].count)} <span className="text-lg font-normal text-slate-400">ฉบับ</span></h2>
            </div>
          </div>
        </div>

        {/* --- ส่วนที่เพิ่มมา: รายชื่อ Template (Template Gallery) --- */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-slate-800">แม่แบบเอกสาร (Templates)</h2>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          {templateList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templateList.map((tpl) => (
                <div key={tpl.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg text-blue-700">
                        <FileText size={24} />
                      </div>
                      {/* ปุ่มลบ (ถ้าต้องการใช้ ให้ทำ API Delete เพิ่ม) */}
                      {/* <button className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button> */}
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1" title={tpl.name}>{tpl.name}</h3>
                    <p className="text-xs text-slate-400">อัปโหลดเมื่อ: {tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString('th-TH') : '-'}</p>
                  </div>
                  
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex gap-3">
                    <Link href={`/builder/${tpl.id}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold text-center transition-colors">
                      สร้างเอกสาร
                    </Link>
                    {/* ปุ่มแก้ไข Template (ถ้ามีหน้า edit) */}
                    {/* <Link href={`/templates/${tpl.id}/edit`} className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <FileEdit size={18} />
                    </Link> */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="inline-block p-4 rounded-full bg-slate-100 mb-4 text-slate-400"><Layout size={40}/></div>
              <p className="text-slate-500 text-lg">ยังไม่มีแม่แบบเอกสารในระบบ</p>
              <Link href="/templates/upload" className="text-blue-600 hover:underline mt-2 inline-block font-medium">
                คลิกที่นี่เพื่อเพิ่มแม่แบบแรก
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <History size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-700">ประวัติการสร้างล่าสุด</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">ชื่อเอกสาร</th>
                  <th className="px-6 py-3">แม่แบบ</th>
                  <th className="px-6 py-3">วันที่สร้าง</th>
                  <th className="px-6 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{doc.name}</td>
                    <td className="px-6 py-4 text-slate-500">{doc.template?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-slate-400">{doc.createdAt ? new Date(doc.createdAt).toLocaleString('th-TH') : '-'}</td>
                    <td className="px-6 py-4 text-right">
                        {/* ลิงก์ไปหน้าพรีวิวหรือดาวน์โหลด */}
                        <span className="inline-flex gap-2">
                            <a href="#" className="text-blue-600 hover:text-blue-800 font-bold">ดาวน์โหลด</a>
                        </span>
                    </td>
                  </tr>
                ))}
                {recentDocs.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-slate-400">ไม่มีประวัติการใช้งาน</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}