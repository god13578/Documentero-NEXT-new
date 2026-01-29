'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, ChevronDown, Calendar, Type, Hash, List, User, FileText } from 'lucide-react';

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'fulldate' | 'select';

export interface FieldConfigMap {
  [key: string]: {
    type: FieldType;
    label?: string;
    options?: string[];
    placeholder?: string;
  };
}

interface Props {
  fields: string[];
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
  onFocusField: (field: string | null) => void;
}

export default function DynamicFieldBuilder({ fields, values, onChange, onFocusField }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [fieldConfig, setFieldConfig] = useState<FieldConfigMap>({});

  // Initialize field config with default values
  useEffect(() => {
    const defaultConfig: FieldConfigMap = {};
    fields.forEach(field => {
      defaultConfig[field] = {
        type: 'text',
        label: field,
        placeholder: `กรุณากรอก${field}`
      };
    });
    setFieldConfig(defaultConfig);
  }, [fields]);

  const handleFieldFocus = useCallback((field: string) => {
    onFocusField(field);
  }, [onFocusField]);

  const handleFieldBlur = useCallback(() => {
    onFocusField(null);
  }, [onFocusField]);

  const handleFieldClick = useCallback((field: string) => {
    // Scroll to field and highlight it
    const element = document.getElementById(`field-input-${field}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
      }, 2000);
    }
  }, []);

  const getFieldTypeIcon = (type: FieldType) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'textarea':
        return <FileText className="w-4 h-4" />;
      case 'number':
        return <Hash className="w-4 h-4" />;
      case 'date':
      case 'fulldate':
        return <Calendar className="w-4 h-4" />;
      case 'select':
        return <List className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  const renderFieldInput = (field: string, config: any) => {
    const commonProps = {
      id: `field-input-${field}`,
      value: values[field] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field, e.target.value),
      onFocus: () => handleFieldFocus(field),
      onBlur: handleFieldBlur,
      className: `w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:border-slate-400`,
      placeholder: config.placeholder || `กรุณากรอก${config.label || field}`
    };

    switch (config.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`${commonProps.className} resize-none`}
          />
        );
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
          />
        );
      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
          />
        );
      case 'select':
        return (
          <select
            {...commonProps}
            value={values[field] || ''}
            onChange={(e) => onChange(field, e.target.value)}
          >
            <option value="">เลือก...</option>
            {config.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            {...commonProps}
            type="text"
          />
        );
    }
  };

  if (fields.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">ไม่พบช่องข้อมูล</p>
        <p className="text-slate-400 text-sm mt-1">แม่แบบนี้ไม่มีช่องสำหรับกรอกข้อมูล</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fields.map((field: string) => {
        const config = fieldConfig[field] || { type: 'text', label: field };
        const isEditing = editing === field;
        
        return (
          <div 
            key={field} 
            className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300"
          >
            {/* Field Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  {getFieldTypeIcon(config.type)}
                </div>
                <div>
                  <label 
                    htmlFor={`field-input-${field}`}
                    className="font-semibold text-slate-800 text-sm cursor-pointer hover:text-blue-700 transition-colors"
                    onClick={() => handleFieldClick(field)}
                  >
                    {config.label || field}
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    {config.type === 'text' && 'ข้อความสั้น'}
                    {config.type === 'textarea' && 'ข้อความยาว'}
                    {config.type === 'number' && 'ตัวเลข'}
                    {config.type === 'date' && 'วันที่'}
                    {config.type === 'fulldate' && 'วันที่เต็ม'}
                    {config.type === 'select' && 'เลือกจากรายการ'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setEditing(isEditing ? null : field)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="ตั้งค่าช่องข้อมูล"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Field Input */}
            <div className="relative">
              {renderFieldInput(field, config)}
              
              {/* Field indicator dot */}
              <div className="absolute top-3 right-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>

            {/* Field Settings (when editing) */}
            {isEditing && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      ประเภทช่องข้อมูล
                    </label>
                    <select
                      value={config.type}
                      onChange={(e) => setFieldConfig(prev => ({
                        ...prev,
                        [field]: { ...config, type: e.target.value as FieldType }
                      }))}
                      className="w-full text-xs border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="text">ข้อความสั้น</option>
                      <option value="textarea">ข้อความยาว</option>
                      <option value="number">ตัวเลข</option>
                      <option value="date">วันที่</option>
                      <option value="fulldate">วันที่เต็ม</option>
                      <option value="select">เลือกจากรายการ</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      ชื่อแสดง (Label)
                    </label>
                    <input
                      type="text"
                      value={config.label || ''}
                      onChange={(e) => setFieldConfig(prev => ({
                        ...prev,
                        [field]: { ...config, label: e.target.value }
                      }))}
                      placeholder="ชื่อแสดง"
                      className="w-full text-xs border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
                
                {config.type === 'select' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      ตัวเลือก (คั่นด้วยคอมม่า)
                    </label>
                    <input
                      type="text"
                      value={config.options?.join(', ') || ''}
                      onChange={(e) => setFieldConfig(prev => ({
                        ...prev,
                        [field]: { 
                          ...config, 
                          options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                        }
                      }))}
                      placeholder="ตัวเลือกที่ 1, ตัวเลือกที่ 2, ตัวเลือกที่ 3"
                      className="w-full text-xs border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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