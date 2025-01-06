import React from 'react';

export function FeeCard({ fee }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-xl font-bold">Month: {fee.month}</h3>
      <p>Amount: ${fee.amount}</p>
      <p className="text-sm text-gray-500">Due Date: {new Date(fee.due_date).toLocaleDateString()}</p>
    </div>
  );
}
