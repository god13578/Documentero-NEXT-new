'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, ChevronDown, Calendar, Type, Hash, List } from 'lucide-react';

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
      const el = document.getElementById(`field-input-${focusedField}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-yellow-400', 'bg-yellow-50');
        setTimeout(() => el.classList.remove('ring-2', 'ring-yellow-400', 'bg-yellow-50'), 2000);
      }
    }
  }, [focusedField]);

  return (
    <div className="space-y-4 pb-24">
      {fields.length === 0 && <p className="text-center text-gray-400 mt-10">No fields detected</p>}
      {fields.map((field: string) => {
        const config = fieldConfig[field] || { type: 'text' };
        return (
          <div key={field} id={`field-input-${field}`} className="bg-white p-4 rounded-xl border hover:border-blue-400 transition-all shadow-sm">
            <div className="flex justify-between mb-2">
              <label className="font-semibold text-sm text-gray-700">{config.label || field}</label>
              <button onClick={() => setEditing(editing === field ? null : field)}><Settings size={14} className="text-gray-400"/></button>
            </div>
            {config.type === 'textarea' ? (
              <textarea value={values[field] || ''} onChange={e => onChange(field, e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none" rows={3} />
            ) : (
              <input type={config.type === 'number' ? 'number' : 'text'} value={values[field] || ''} onChange={e => onChange(field, e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none" />
            )}
            {editing === field && (
              <div className="mt-2 pt-2 border-t text-xs">
                Type: <select value={config.type} onChange={e => onConfigChange({...fieldConfig, [field]: {...config, type: e.target.value}})} className="border rounded p-1"><option value="text">Text</option><option value="date">Date</option></select>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 