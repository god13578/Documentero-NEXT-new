'use client';
import React from 'react';
import { Calendar, User, FileType, MapPin, Hash, Mail, FileText, Phone, DollarSign } from 'lucide-react';

interface Props {
  fields: any[];
  value: any;
  onChange: (val: any) => void;
  onFocusField: (name: string | null) => void;
}

// ฟังก์ชันอัจฉริยะ เลือกไอคอนให้ตรงกับชื่อช่อง
const getIconForField = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('date') || n.includes('วัน') || n.includes('เวลา')) return <Calendar size={18} />;
  if (n.includes('name') || n.includes('ชื่อ') || n.includes('ผู้')) return <User size={18} />;
  if (n.includes('address') || n.includes('ที่อยู่') || n.includes('location')) return <MapPin size={18} />;
  if (n.includes('tel') || n.includes('โทร')) return <Phone size={18} />;
  if (n.includes('price') || n.includes('ราคา') || n.includes('บาท') || n.includes('เงิน')) return <DollarSign size={18} />;
  if (n.includes('email') || n.includes('เมล์')) return <Mail size={18} />;
  if (n.includes('no') || n.includes('เลข') || n.includes('code')) return <Hash size={18} />;
  return <FileText size={18} />;
};

export default function DynamicFieldBuilder({ fields, value, onChange, onFocusField }: Props) {
  if (!fields || fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <div className="bg-slate-100 p-3 rounded-full mb-3">
          <FileText className="text-slate-400" size={24} />
        </div>
        <p className="text-slate-500 font-medium">ไม่พบช่องข้อมูลที่ต้องกรอก</p>
        <p className="text-slate-400 text-xs mt-1">เอกสารนี้อาจไม่มีตัวแปร {`{variable}`}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20">
      {fields.map((field, idx) => (
        <div 
          key={field.name} 
          className="group relative transition-all duration-300 ease-out"
          style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.05}s backwards` }}
        >
          {/* Label */}
          <div className="flex justify-between items-end mb-2 ml-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">
              {field.name.replace(/_/g, ' ')}
            </label>
            {value[field.name] && (
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-100 animate-in fade-in zoom-in">
                กรอกแล้ว
              </span>
            )}
          </div>

          {/* Input Wrapper */}
          <div className="relative group-focus-within:scale-[1.01] transition-transform duration-200">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200">
              {getIconForField(field.name)}
            </div>
            
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-[15px] font-medium 
                         placeholder:text-slate-300 shadow-sm
                         focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-md
                         hover:border-slate-300 transition-all outline-none"
              placeholder={`ระบุข้อมูล...`}
              value={value[field.name] || ""}
              onChange={(e) => onChange({ ...value, [field.name]: e.target.value })}
              onFocus={() => onFocusField(field.name)}
              onBlur={() => onFocusField(null)}
            />

            {/* Focus Indicator Bar */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-500 rounded-l-xl transition-all duration-200 group-focus-within:h-3/4 opacity-0 group-focus-within:opacity-100"></div>
          </div>
        </div>
      ))}
      
      {/* CSS Animation for staggering */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}