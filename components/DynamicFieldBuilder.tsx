"use client";

import { useState, useEffect } from "react";

interface FieldOption {
  label: string;
  value: string;
}

interface FieldDependency {
  field: string;
  condition: string;
  action: string;
}

interface TemplateField {
  id: string;
  name: string;
  fieldType: "text" | "date" | "fulldate" | "select" | "multiselect";
  fieldOptions?: FieldOption[];
  fieldDependencies?: FieldDependency[];
  defaultValue?: string;
  isRequired: boolean;
  fieldOrder: number;
}

interface DynamicFieldBuilderProps {
  templateId: string;
  fields: TemplateField[];
  onFieldsChange: (fields: TemplateField[]) => void;
}

export default function DynamicFieldBuilder({ 
  templateId, 
  fields, 
  onFieldsChange 
}: DynamicFieldBuilderProps) {
  const [newField, setNewField] = useState<Partial<TemplateField>>({
    name: "",
    fieldType: "text",
    isRequired: false,
    fieldOrder: fields.length
  });

  const [editingField, setEditingField] = useState<string | null>(null);

  const addField = () => {
    if (!newField.name) return;

    const field: TemplateField = {
      id: Date.now().toString(),
      name: newField.name!,
      fieldType: newField.fieldType as any,
      fieldOptions: newField.fieldOptions || [],
      fieldDependencies: newField.fieldDependencies || [],
      defaultValue: newField.defaultValue,
      isRequired: newField.isRequired || false,
      fieldOrder: newField.fieldOrder || fields.length
    };

    onFieldsChange([...fields, field]);
    setNewField({
      name: "",
      fieldType: "text",
      isRequired: false,
      fieldOrder: fields.length + 1
    });
  };

  const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
    const updatedFields = fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    onFieldsChange(updatedFields);
  };

  const deleteField = (fieldId: string) => {
    const updatedFields = fields.filter(field => field.id !== fieldId);
    onFieldsChange(updatedFields);
  };

  const addFieldOption = (fieldId: string, option: FieldOption) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const updatedOptions = [...(field.fieldOptions || []), option];
    updateField(fieldId, { fieldOptions: updatedOptions });
  };

  const removeFieldOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const updatedOptions = field.fieldOptions?.filter((_, index) => index !== optionIndex) || [];
    updateField(fieldId, { fieldOptions: updatedOptions });
  };

  const renderFieldInput = (field: TemplateField) => {
    switch (field.fieldType) {
      case "text":
        return (
          <input
            type="text"
            placeholder={`กรอก${field.name}`}
            className="w-full p-2 border rounded"
          />
        );
      
      case "date":
        return (
          <input
            type="date"
            className="w-full p-2 border rounded"
          />
        );
      
      case "fulldate":
        return (
          <input
            type="text"
            placeholder="วันจันทร์ที่ 2 มกราคม 2568"
            className="w-full p-2 border rounded"
          />
        );
      
      case "select":
        return (
          <select className="w-full p-2 border rounded">
            <option value="">เลือก...</option>
            {field.fieldOptions?.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case "multiselect":
        return (
          <div className="space-y-2">
            {field.fieldOptions?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input type="checkbox" value={option.value} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Field */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">➕ เพิ่ม Field ใหม่</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="ชื่อ Field"
            value={newField.name || ""}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            className="p-2 border rounded"
          />
          
          <select
            value={newField.fieldType}
            onChange={(e) => setNewField({ ...newField, fieldType: e.target.value as any })}
            className="p-2 border rounded"
          >
            <option value="text">Text</option>
            <option value="date">Date (1 มกราคม 2568)</option>
            <option value="fulldate">Full Date (วันจันทร์ที่ 2 มกราคม 2568)</option>
            <option value="select">Select (Dropdown)</option>
            <option value="multiselect">Multi Select (Checkbox)</option>
          </select>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newField.isRequired || false}
              onChange={(e) => setNewField({ ...newField, isRequired: e.target.checked })}
            />
            <span>จำเป็นต้องกรอก</span>
          </label>
        </div>

        <button
          onClick={addField}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          เพิ่ม Field
        </button>
      </div>

      {/* Fields List */}
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold">{field.name}</h4>
                <span className="text-sm text-gray-500">
                  Type: {field.fieldType} {field.isRequired && "(Required)"}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Field Preview */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Preview:</label>
              {renderFieldInput(field)}
            </div>

            {/* Edit Field Options */}
            {editingField === field.id && (
              <div className="border-t pt-4 space-y-4">
                {/* Options for Select/MultiSelect */}
                {(field.fieldType === "select" || field.fieldType === "multiselect") && (
                  <div>
                    <h5 className="font-medium mb-2">Options:</h5>
                    <div className="space-y-2">
                      {field.fieldOptions?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) => {
                              const updatedOptions = [...(field.fieldOptions || [])];
                              updatedOptions[index] = { ...option, label: e.target.value };
                              updateField(field.id, { fieldOptions: updatedOptions });
                            }}
                            className="flex-1 p-1 border rounded"
                            placeholder="Label"
                          />
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) => {
                              const updatedOptions = [...(field.fieldOptions || [])];
                              updatedOptions[index] = { ...option, value: e.target.value };
                              updateField(field.id, { fieldOptions: updatedOptions });
                            }}
                            className="flex-1 p-1 border rounded"
                            placeholder="Value"
                          />
                          <button
                            onClick={() => removeFieldOption(field.id, index)}
                            className="text-red-500"
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={() => addFieldOption(field.id, { label: "", value: "" })}
                        className="text-blue-500 text-sm"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                <div>
                  <h5 className="font-medium mb-2">Dependencies:</h5>
                  <div className="text-sm text-gray-500">
                    ยังไม่ได้ implement - จะมาทำในรุ่นถัดไป
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
