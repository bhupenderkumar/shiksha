import React from 'react';

export function FeeCard({ fee }) {
  return (
    <div className="bg-card shadow-md rounded-lg p-4 mb-4 border border-border">
      <h3 className="text-xl font-bold text-foreground">Month: {fee.month}</h3>
      <p className="text-foreground">Amount: ${fee.amount}</p>
      <p className="text-sm text-muted-foreground">Due Date: {new Date(fee.due_date).toLocaleDateString()}</p>
    </div>
  );
}
