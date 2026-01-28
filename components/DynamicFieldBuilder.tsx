'use client';
import React, { useState, useEffect } from 'react';
import { Settings, X, ChevronDown, Calendar, Type, Hash, List } from 'lucide-react';

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

  useEffect(() => {
    if (focusedField) {
      document.getElementById(`field-${focusedField}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        
        return (
          <div key={field} id={`field-${field}`} className={`p-4 rounded-xl border transition-all ${focusedField === field ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white hover:border-blue-300'}`}>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">{config.label || field} <span className="text-xs text-gray-400 font-mono">({field})</span></label>
              <button onClick={() => setEditing(isEdit ? null : field)} className="text-gray-400 hover:text-blue-600"><Settings size={16} /></button>
            </div>

            {config.type === 'textarea' ? (
              <textarea value={values[field] || ''} onChange={e => onChange(field, e.target.value)} className="w-full p-2 border rounded" rows={3} />
            ) : config.type === 'select' ? (
              <div className="relative">
                <select value={values[field] || ''} onChange={e => onChange(field, e.target.value)} className="w-full p-2 border rounded appearance-none bg-white">
                  <option value="">-- เลือก --</option>
                  {config.options?.map((o: string, i: number) => <option key={i} value={o}>{o}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-3 text-gray-400" size={16} />
              </div>
            ) : (
              <input 
                type={config.type.includes('date') ? 'date' : 'text'} 
                value={values[field] || ''} 
                onChange={e => onChange(field, e.target.value)} 
                className="w-full p-2 border rounded" 
              />
            )}

            {isEdit && (
              <div className="mt-3 p-3 bg-gray-50 rounded border text-sm">
                <div className="mb-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">ประเภทข้อมูล (Data Type)</label>
                  <select value={config.type} onChange={e => updateConfig(field, { type: e.target.value })} className="w-full p-1 border rounded">
                    <option value="text">ข้อความ (Text)</option>
                    <option value="textarea">ข้อความยาว (Text Area)</option>
                    <option value="number">ตัวเลข (Number)</option>
                    <option value="date">วันที่ย่อ (6 มกราคม 2568)</option>
                    <option value="fulldate">วันที่เต็ม (วันศุกร์ที่ 6 มกราคม 2568)</option>
                    <option value="select">ตัวเลือก (Dropdown)</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">ชื่อที่แสดง (Label)</label>
                  <input value={config.label || ''} onChange={e => updateConfig(field, { label: e.target.value })} className="w-full p-1 border rounded" placeholder={field} />
                </div>
                {config.type === 'select' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">ตัวเลือก (คั่นด้วย ,)</label>
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