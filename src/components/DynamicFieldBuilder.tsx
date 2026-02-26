'use client';
import React, { useState } from 'react';
import { Settings, Check, X, Calendar, Type, List, CheckSquare } from 'lucide-react';
import { updateFieldConfig } from '@/app/builder/actions';

interface Props {
  fields: any[];
  value: any;
  onChange: (val: any) => void;
  onFocusField: (name: string | null) => void;
}

// ฟังก์ชันอัจฉริยะ แปลงวันที่เป็นภาษาไทย
const formatThaiDate = (dateString: string, type: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const days = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear() + 543;
  const dayName = days[date.getDay()];

  if (type === 'date-full') return `วัน${dayName}ที่ ${d} ${m} ${y}`;
  return `${d} ${m} ${y}`; // แบบปกติ
};

export default function DynamicFieldBuilder({ fields, value, onChange, onFocusField }: Props) {
  const [configOpen, setConfigOpen] = useState<string | null>(null);
  const [editType, setEditType] = useState('text');
  const [editOptions, setEditOptions] = useState('');

  if (!fields || !fields.length) return <div className="text-center text-slate-400 mt-10 p-8 border-2 border-dashed rounded-xl">ไม่มีช่องข้อมูลในเอกสารนี้</div>;

  const openConfig = (field: any) => {
    setConfigOpen(field.id);
    setEditType(field.type || 'text');
    // แปลง array กลับเป็น string เพื่อให้แก้ไขง่ายๆ
    setEditOptions(field.options && Array.isArray(field.options) ? field.options.join(', ') : '');
  };

  const saveConfig = async (fieldId: string) => {
    const opts = editOptions.split(',').map(s => s.trim()).filter(Boolean);
    const res = await updateFieldConfig(fieldId, editType, opts);
    if (res.success) {
      // อัปเดต UI ทันทีไม่ต้องรีเฟรช
      const field = fields.find(f => f.id === fieldId);
      if (field) { field.type = editType; field.options = opts; }
      setConfigOpen(null);
    } else {
      alert("ไม่สามารถบันทึกการตั้งค่าได้");
    }
  };

  const handleMultiSelect = (fieldName: string, option: string, checked: boolean) => {
    let current = value[fieldName] ? value[fieldName].split(', ') : [];
    if (checked) current.push(option);
    else current = current.filter((i: string) => i !== option);
    onChange({ ...value, [fieldName]: current.join(', ') });
  };

  return (
    <div className="space-y-5 pb-20">
      {fields.map((field) => {
        const type = field.type || 'text';
        const options = field.options || [];

        return (
          <div key={field.id} className="relative group bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-400 hover:shadow-md transition-all">
            
            {/* Header: ชื่อ Field และไอคอนตั้งค่า */}
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{field.name}</label>
              {/* ปุ่มฟันเฟือง จะโผล่มาตอนเอาเมาส์ชี้ */}
              <button 
                onClick={() => openConfig(field)} 
                className="text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-50 rounded-md"
                title="ตั้งค่ารูปแบบช่องกรอก"
              >
                <Settings size={16} />
              </button>
            </div>

            {/* Input Area */}
            <div 
              onFocus={() => onFocusField(field.name)} 
              onBlur={() => onFocusField(null)}
              onClick={() => onFocusField(field.name)}
            >
              {/* 1. Text ปกติ */}
              {type === 'text' && (
                <input 
                  id={`input-field-${field.name}`}
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder={`กรอก ${field.name}...`}
                  value={value[field.name] || ""} 
                  onChange={(e) => onChange({ ...value, [field.name]: e.target.value })} 
                />
              )}

              {/* 2. Dropdown (Select) */}
              {type === 'select' && (
                <select 
                  id={`input-field-${field.name}`}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  value={value[field.name] || ""} 
                  onChange={(e) => onChange({ ...value, [field.name]: e.target.value })}
                >
                  <option value="" disabled>-- เลือกข้อมูล --</option>
                  {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}

              {/* 3. Checkbox (Multi-select) */}
              {type === 'multiselect' && (
                <div id={`input-field-${field.name}`} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {options.map((opt: string) => {
                    const isChecked = (value[field.name] || "").includes(opt);
                    return (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group/chk">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={(e) => handleMultiSelect(field.name, opt, e.target.checked)} 
                          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                        />
                        <span className={`text-sm ${isChecked ? 'text-blue-700 font-bold' : 'text-slate-600 group-hover/chk:text-slate-900'}`}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* 4 & 5. Date Picker (วันที่ไทย) */}
              {(type === 'date-th' || type === 'date-full') && (
                <div className="relative">
                   <div className="absolute left-3 top-[18px] text-slate-400 pointer-events-none"><Calendar size={18}/></div>
                   <input 
                      id={`input-field-${field.name}`}
                      type="date" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                      onChange={(e) => {
                        const thaiStr = formatThaiDate(e.target.value, type);
                        onChange({ ...value, [field.name]: thaiStr });
                      }} 
                   />
                   {value[field.name] && (
                     <div className="mt-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md border border-emerald-100 flex items-center gap-2">
                       <Check size={14}/> <b>ผลลัพธ์:</b> {value[field.name]}
                     </div>
                   )}
                </div>
              )}
            </div>

            {/* โหมดตั้งค่า (Mini Modal) */}
            {configOpen === field.id && (
              <div className="absolute -top-2 -left-2 w-[calc(100%+16px)] h-[calc(100%+16px)] bg-white/95 backdrop-blur-md z-20 flex flex-col p-5 rounded-2xl border border-blue-300 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Settings size={16} className="text-blue-600"/> ตั้งค่าช่องกรอกข้อมูล</h3>
                  <button onClick={() => setConfigOpen(null)} className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors"><X size={18}/></button>
                </div>
                
                <div className="space-y-3 flex-1">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">รูปแบบ (Type)</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" 
                      value={editType} 
                      onChange={(e) => setEditType(e.target.value)}
                    >
                      <option value="text">✍️ ข้อความปกติ (Text)</option>
                      <option value="select">🔽 ตัวเลือกแบบหย่อนลง (Dropdown)</option>
                      <option value="multiselect">☑️ เลือกได้หลายข้อ (Checkbox)</option>
                      <option value="date-th">📅 วันที่ไทย (30 ม.ค. 2569)</option>
                      <option value="date-full">📆 วันที่ไทยเต็ม (วันจันทร์ที่ 30...)</option>
                    </select>
                  </div>

                  {(editType === 'select' || editType === 'multiselect') && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">เพิ่มตัวเลือก (คั่นด้วยลูกน้ำ ,)</label>
                      <input 
                        type="text" 
                        placeholder="เช่น ผ่าน, ไม่ผ่าน, รอพิจารณา" 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 placeholder:text-slate-300"
                        value={editOptions} 
                        onChange={(e) => setEditOptions(e.target.value)} 
                      />
                      <p className="text-[10px] text-slate-400 mt-1">พิมพ์ตัวเลือกแล้วคั่นด้วยเครื่องหมาย , (ลูกน้ำ)</p>
                    </div>
                  )}
                </div>

                <button onClick={() => saveConfig(field.id)} className="w-full mt-4 bg-slate-900 text-white py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors active:scale-95">
                  <Check size={16}/> บันทึกการตั้งค่า
                </button>
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}