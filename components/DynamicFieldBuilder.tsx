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

export default function DynamicFieldBuilder({ fields, values, fieldConfig, onChange, onConfigChange, focusedField }: { fields: string[], values: { [key: string]: string }, fieldConfig: FieldConfigMap, onChange: (field: string, value: string) => void, onConfigChange: (fieldConfig: FieldConfigMap) => void, focusedField: string | null }) {
  const [editing, setEditing] = useState<string | null>(null);

  const scrollToField = useCallback((field: string | null) => {
    if (field) {
      const element = document.getElementById(`field-input-${field}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add flash effect
        element.classList.add('ring-2', 'ring-yellow-400', 'bg-yellow-50');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-yellow-400', 'bg-yellow-50');
        }, 2000);
      }
    }
  }, []);

  useEffect(() => {
    scrollToField(focusedField);
  }, [focusedField, scrollToField]);

  return (
    <div className="space-y-4 pb-20">
      {fields.map((field: string) => {
        const config = fieldConfig[field] || { type: 'text' };
        const isEdit = editing === field;
        
        return (
          <div 
            key={field} 
            id={`field-input-${field}`} // Target for scrolling
            className="p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                {config.label || field}
                <span className="bg-gray-100 text-gray-500 text-[10px] font-mono px-1.5 py-0.5 rounded border">
                  {`{${field}}`}
                </span>
              </label>
              <button onClick={() => setEditing(isEdit ? null : field)} className="text-gray-400 hover:text-indigo-600">
                <Settings size={14} />
              </button>
            </div>

            {config.type === 'textarea' ? (
              <textarea 
                value={values[field] || ''} 
                onChange={e => onChange(field, e.target.value)} 
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
                rows={3}
              />
            ) : (
              <input 
                type={config.type === 'number' ? 'number' : 'text'}
                value={values[field] || ''} 
                onChange={e => onChange(field, e.target.value)} 
                className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none"
              />
            )}

            {isEdit && (
              <div className="mt-3 pt-3 border-t bg-gray-50 -mx-4 -mb-4 p-3 rounded-b-xl text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium mb-1">Type</label>
                    <select 
                      value={config.type} 
                      onChange={e => onConfigChange({...fieldConfig, [field]: {...config, type: e.target.value as FieldType}})}
                      className="w-full p-1 border rounded"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Text Area</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="fulldate">Full Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Label</label>
                    <input 
                      value={config.label || ''} 
                      onChange={e => onConfigChange({...fieldConfig, [field]: {...config, label: e.target.value}})}
                      className="w-full p-1 border rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}