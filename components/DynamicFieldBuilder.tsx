'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'fulldate' | 'select' | 'multiselect';

export interface FieldConfigItem {
  type: FieldType;
  label?: string;
  options?: string[]; // For select/multiselect
  placeholder?: string;
}

export interface FieldConfigMap {
  [key: string]: FieldConfigItem;
}

interface DynamicFieldBuilderProps {
  fields: string[];
  values: Record<string, any>;
  fieldConfig: FieldConfigMap;
  onChange: (key: string, value: any) => void;
  onConfigChange: (newConfig: FieldConfigMap) => void;
  focusedField?: string | null;
}

export default function DynamicFieldBuilder({
  fields,
  values,
  fieldConfig,
  onChange,
  onConfigChange,
  focusedField
}: DynamicFieldBuilderProps) {
  const [editingConfig, setEditingConfig] = useState<string | null>(null);

  // Scroll to focused field
  useEffect(() => {
    if (focusedField) {
      const element = document.getElementById(`input-field-${focusedField}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
        // Add a temporary highlight animation class if needed
        element.classList.add('ring-2', 'ring-yellow-400');
        setTimeout(() => element.classList.remove('ring-2', 'ring-yellow-400'), 1500);
      }
    }
  }, [focusedField]);

  const handleConfigUpdate = (field: string, updates: Partial<FieldConfigItem>) => {
    const currentConfig = fieldConfig[field] || { type: 'text' };
    onConfigChange({
      ...fieldConfig,
      [field]: { ...currentConfig, ...updates }
    });
  };

  const addOption = (field: string) => {
    const config = fieldConfig[field] || { type: 'select', options: [] };
    const currentOptions = config.options || [];
    handleConfigUpdate(field, { options: [...currentOptions, 'New Option'] });
  };

  const updateOption = (field: string, index: number, value: string) => {
    const config = fieldConfig[field];
    if (!config?.options) return;
    const newOptions = [...config.options];
    newOptions[index] = value;
    handleConfigUpdate(field, { options: newOptions });
  };

  const removeOption = (field: string, index: number) => {
    const config = fieldConfig[field];
    if (!config?.options) return;
    const newOptions = config.options.filter((_, i) => i !== index);
    handleConfigUpdate(field, { options: newOptions });
  };

  return (
    <div className="space-y-6 p-4 pb-20">
      {fields.map((field) => {
        const config = fieldConfig[field] || { type: 'text' };
        const isEditing = editingConfig === field;

        return (
          <div 
            key={field} 
            className={`relative p-4 rounded-lg border transition-all ${
              focusedField === field ? 'border-yellow-400 bg-yellow-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <label 
                htmlFor={`input-field-${field}`}
                className="block text-sm font-semibold text-gray-700 break-all"
              >
                {config.label || field}
                <span className="text-xs font-normal text-gray-400 ml-2">({field})</span>
              </label>
              <button
                onClick={() => setEditingConfig(isEditing ? null : field)}
                className={`p-1 rounded-md hover:bg-gray-100 ${isEditing ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
                title="ตั้งค่า Field"
              >
                <Settings size={16} />
              </button>
            </div>

            {/* Input Renderer based on Type */}
            <div className="mt-1">
              {config.type === 'textarea' ? (
                <textarea
                  id={`input-field-${field}`}
                  value={values[field] || ''}
                  onChange={(e) => onChange(field, e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                />
              ) : config.type === 'select' ? (
                <select
                  id={`input-field-${field}`}
                  value={values[field] || ''}
                  onChange={(e) => onChange(field, e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">-- เลือกรายการ --</option>
                  {config.options?.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : config.type === 'date' || config.type === 'fulldate' ? (
                 <div className="flex flex-col gap-1">
                    <input
                      type="date"
                      id={`input-field-${field}`}
                      value={values[field] || ''}
                      onChange={(e) => onChange(field, e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-xs text-gray-500">
                      ผลลัพธ์: {config.type === 'fulldate' ? '1 มกราคม 2569' : '1 ม.ค. 2569'}
                    </span>
                 </div>
              ) : (
                <input
                  type={config.type === 'number' ? 'number' : 'text'}
                  id={`input-field-${field}`}
                  value={values[field] || ''}
                  onChange={(e) => onChange(field, e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                />
              )}
            </div>

            {/* Config Panel (Toggleable) */}
            {isEditing && (
              <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 p-3 rounded-md animate-in fade-in slide-in-from-top-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">ตั้งค่า Field</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">ประเภทข้อมูล (Input Type)</label>
                    <select
                      value={config.type}
                      onChange={(e) => handleConfigUpdate(field, { type: e.target.value as FieldType })}
                      className="w-full text-sm p-1.5 border rounded"
                    >
                      <option value="text">ข้อความ (Text)</option>
                      <option value="textarea">ข้อความยาว (Text Area)</option>
                      <option value="number">ตัวเลข (Number)</option>
                      <option value="date">วันที่ย่อ (1 ม.ค. 68)</option>
                      <option value="fulldate">วันที่เต็ม (1 มกราคม 2568)</option>
                      <option value="select">ตัวเลือก (Dropdown)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 block mb-1">ชื่อที่แสดง (Label)</label>
                    <input
                      type="text"
                      value={config.label || ''}
                      placeholder={field}
                      onChange={(e) => handleConfigUpdate(field, { label: e.target.value })}
                      className="w-full text-sm p-1.5 border rounded"
                    />
                  </div>

                  {/* Option Builder for Select */}
                  {config.type === 'select' && (
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">ตัวเลือก (Options)</label>
                      <div className="space-y-2">
                        {config.options?.map((opt, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(field, idx, e.target.value)}
                              className="flex-1 text-sm p-1 border rounded"
                            />
                            <button 
                              onClick={() => removeOption(field, idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(field)}
                          className="flex items-center text-xs text-blue-600 hover:underline mt-1"
                        >
                          <Plus size={12} className="mr-1" /> เพิ่มตัวเลือก
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {fields.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          ไม่พบ Field ในเอกสาร
        </div>
      )}
    </div>
  );
}