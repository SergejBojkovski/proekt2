import React, { useState } from 'react';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (questionText: string) => void;
}

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [questionText, setQuestionText] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuestionText(event.target.value);
  };

  const handleSubmit = () => {
    onAdd(questionText);
    setQuestionText(''); // Reset input field after submitting
    onClose();
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50"></div>
      <div className="z-10 bg-white p-8 rounded shadow-md w-[450px]">
        <h2 className="text-lg font-semibold mb-4">Add a Question</h2>
        <input
          type="text"
          value={questionText}
          onChange={handleChange}
          className="border border-gray-300 rounded-md px-3 py-2 mb-4 w-full"
          placeholder="Enter your question here"
        />
        <div className="flex justify-center grid-cols-4 gap-4">
          <button onClick={handleSubmit} className="bg-blue-500 text-dark px-4 py-2 rounded-md mr-2 hover:bg-blue-600 border w-[30%]">Submit</button>
          <button onClick={onClose} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 border w-[30%]">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionModal;
