'use client';
import React, { useState, useEffect } from 'react';
import { Settings, Type, AlignLeft, Calendar, Hash, List, ChevronDown } from 'lucide-react';

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'fulldate' | 'select';

export interface FieldConfigMap {
  [key: string]: {
    type: FieldType;
    label?: string;
    options?: string[];
    placeholder?: string;
  };
}

export default function DynamicFieldBuilder({ fields, values, fieldConfig, onChange, onConfigChange, focusedField }: any) {
  const [editing, setEditing] = useState<string | null>(null);

  // Auto-scroll when focusedField changes (from Preview click)
  useEffect(() => {
    if (focusedField) {
      const el = document.getElementById(`field-${focusedField}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary flash effect
        el.classList.add('ring-2', 'ring-yellow-400');
        setTimeout(() => el.classList.remove('ring-2', 'ring-yellow-400'), 1500);
      }
    }
  }, [focusedField]);

  const updateConfig = (field: string, updates: any) => {
    onConfigChange({ ...fieldConfig, [field]: { ...(fieldConfig[field] || { type: 'text' }), ...updates } });
  };

  return (
    <div className="space-y-4 pb-20">
      {fields.length === 0 && <div className="text-center text-gray-400 py-10">ไม่พบ Field (ตัวแปร) ในไฟล์ Word</div>}
      
      {fields.map((field: string) => {
        const config = fieldConfig[field] || { type: 'text' };
        const isEdit = editing === field;
        const isFocused = focusedField === field;

        return (
          <div 
            key={field} 
            id={`field-${field}`} // ID for scroll target
            className={`p-4 rounded-xl border transition-all duration-300 bg-white ${isFocused ? 'border-yellow-400 shadow-md bg-yellow-50' : 'border-gray-200 hover:border-blue-300'}`}
          >
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                {config.label || field}
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                  {`{${field}}`}
                </span>
              </label>
              <button onClick={() => setEditing(isEdit ? null : field)} className="text-gray-400 hover:text-blue-600"><Settings size={14} /></button>
            </div>

            {config.type === 'textarea' ? (
              <textarea 
                value={values[field] || ''} 
                onChange={e => onChange(field, e.target.value)} 
                className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                rows={3} 
                placeholder={config.placeholder}
              />
            ) : config.type === 'select' ? (
              <div className="relative">
                <select value={values[field] || ''} onChange={e => onChange(field, e.target.value)} className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none">
                  <option value="">-- เลือก --</option>
                  {config.options?.map((o: string, i: number) => <option key={i} value={o}>{o}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-3 text-gray-400" size={16} />
              </div>
            ) : (
              <div className="relative">
                <input 
                  type={config.type === 'number' ? 'number' : config.type.includes('date') ? 'date' : 'text'}
                  value={values[field] || ''} 
                  onChange={e => onChange(field, e.target.value)} 
                  className="w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder={config.placeholder}
                />
              </div>
            )}

            {isEdit && (
              <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs animate-in slide-in-from-top-1 bg-gray-50 p-2 rounded">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Type</label>
                  <select value={config.type} onChange={e => updateConfig(field, { type: e.target.value })} className="w-full p-1 border rounded bg-white">
                    <option value="text">ข้อความ (Text)</option>
                    <option value="textarea">ข้อความยาว (Text Area)</option>
                    <option value="number">ตัวเลข (Number)</option>
                    <option value="date">วันที่ย่อ (6 มกราคม 2568)</option>
                    <option value="fulldate">วันที่เต็ม (วันศุกร์ที่ 6 มกราคม 2568)</option>
                    <option value="select">ตัวเลือก (Dropdown)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Label</label>
                  <input value={config.label || ''} onChange={e => updateConfig(field, { label: e.target.value })} className="w-full p-1 border rounded" />
                </div>
                {config.type === 'select' && (
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">ตัวเลือก (คั่นด้วย ,)</label>
                    <input 
                      value={config.options?.join(',') || ''} 
                      onChange={e => updateConfig(field, { options: e.target.value.split(',') })} 
                      className="w-full p-1 border rounded" 
                      placeholder="ตัวเลือก1,ตัวเลือก2"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}