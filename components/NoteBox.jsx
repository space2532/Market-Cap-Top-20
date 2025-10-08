import React, { useEffect, useState } from 'react';

const NoteBox = ({ title = '', content = '', onSave, onDelete }) => {
  const [text, setText] = useState(content || '');

  useEffect(() => {
    setText(content || '');
  }, [content]);

  const handleSave = () => {
    if (typeof onSave === 'function') {
      onSave(text);
    }
  };

  const handleDelete = () => {
    if (typeof onDelete === 'function') {
      onDelete();
    }
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            저장
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            삭제
          </button>
        </div>
      </div>
      <div className="p-4">
        <label className="sr-only" htmlFor="note-textarea">
          {title}
        </label>
        <textarea
          id="note-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="block w-full resize-y rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm outline-none ring-0 focus:border-blue-400"
          placeholder="메모를 입력하세요..."
        />
      </div>
    </div>
  );
};

export default NoteBox;


