'use client';
import { useState } from 'react';

interface BuilderFormProps {
  action: (formData: FormData) => Promise<any>;
}

export default function BuilderForm({ action }: BuilderFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData(e.currentTarget);
      const result = await action(formData);
      if (result.ok) {
        setMessage('Template uploaded successfully!');
        e.currentTarget.reset();
      }
    } catch (error) {
      setMessage('Error uploading template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Template</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Template Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium mb-2">
            DOCX File
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".docx"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Uploading...' : 'Upload Template'}
        </button>

        {message && (
          <div className={`p-3 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
