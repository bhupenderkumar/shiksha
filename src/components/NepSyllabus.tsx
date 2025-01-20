import React from 'react';

interface NepSyllabusProps {
  className: string;
}

const NepSyllabus: React.FC<NepSyllabusProps> = ({ className }) => {
  const syllabus = {
    Nursery: '1 to 50 and A to Z and Hindi aa se gya',
    // Add other classes as needed
  };

  return (
    <div className={`p-4 border rounded ${className}`}>
      <h2 className="text-lg font-semibold mb-2">NEP Syllabus</h2>
      <div>
        {Object.entries(syllabus).map(([className, details]) => (
          <div key={className} className="mb-4">
            <h3 className="text-md font-medium">{className}</h3>
            <p>{details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NepSyllabus;