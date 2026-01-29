'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock,
  File,
  BarChart3,
  Eye,
  Loader2
} from 'lucide-react';
import { formatThaiDate } from '../../../utils/thaidate-helper';

interface Template {
  id: string;
  name: string;
  createdAt: string;
}

interface Document {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  createdAt: string;
  docxPath: string;
  pdfPath?: string;
}

interface Stats {
  totalTemplates: number;
  totalDocuments: number;
  documentsToday: number;
  recentDocuments: Document[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Load templates count
        const templatesRes = await fetch('/api/templates/list');
        const templates: Template[] = templatesRes.ok ? await templatesRes.json() : [];
        
        // Load documents
        const documentsRes = await fetch('/api/documents/list');
        const documents: Document[] = documentsRes.ok ? await documentsRes.json() : [];
        
        // Calculate today's documents
        const today = new Date().toISOString().split('T')[0];
        const todayDocuments = documents.filter(doc => 
          doc.createdAt.startsWith(today)
        ).length;

        // Get recent documents (last 10)
        const recentDocuments = documents
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);

        setStats({
          totalTemplates: templates.length,
          totalDocuments: documents.length,
          documentsToday: todayDocuments,
          recentDocuments
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleDownload = async (documentId: string, type: 'docx' | 'pdf') => {
    setDownloading(`${documentId}-${type}`);
    try {
      const response = await fetch(`/api/documents/${documentId}/download?type=${type}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document.${type}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <BarChart3 className="text-blue-600" />
                แดชบอร์ดระบบเอกสารราชการ
              </h1>
              <p className="text-slate-600 mt-1">ภาพรวมการใช้งานระบบและประวัติล่าสุด</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/templates/upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                อัปโหลด Template
              </Link>
              <Link
                href="/templates"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                ดู Templates
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">จำนวน Templates</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalTemplates || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">เอกสารทั้งหมด</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.totalDocuments || 0}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <File className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">เอกสารวันนี้</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.documentsToday || 0}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-600" />
              ประวัติเอกสารล่าสุด
            </h2>
          </div>
          
          <div className="p-6">
            {stats?.recentDocuments.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">ยังไม่มีเอกสารในระบบ</p>
                <p className="text-slate-400 text-sm mt-1">เริ่มสร้างเอกสารจาก template เพื่อดูประวัติ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">ชื่อเอกสาร</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Template</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">วันที่สร้าง</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-slate-700">ดาวน์โหลด</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{doc.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-600">{doc.templateName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-600">
                            {formatThaiDate(doc.createdAt, 'short')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDownload(doc.id, 'docx')}
                              disabled={downloading === `${doc.id}-docx`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                              title="ดาวน์โหลด Word"
                            >
                              {downloading === `${doc.id}-docx` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDownload(doc.id, 'pdf')}
                              disabled={downloading === `${doc.id}-pdf`}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="ดาวน์โหลด PDF"
                            >
                              {downloading === `${doc.id}-pdf` ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <File className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
