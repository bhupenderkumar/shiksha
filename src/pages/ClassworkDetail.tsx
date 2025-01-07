import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchClassworkDetails } from '@/services/classworkService';
import { fileTableService } from '@/services/fileTableService';

const ClassworkDetail = () => {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const [classworkDetails, setClassworkDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getClassworkDetails = async () => {
      try {
        const data = await fetchClassworkDetails(id);
        const files = await fileTableService.getFilesByClassworkId(id);
        const attachments = files.map(file => ({
          id: file.id,
          fileName: file.fileName,
          url: file.publicUrl // Assuming publicUrl is available in file object
        }));
        setClassworkDetails({ ...data, attachments });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getClassworkDetails();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-500">Back</button>
      <h1 className="text-2xl font-bold">{classworkDetails.title}</h1>
      <p>{classworkDetails.description}</p>
      <p><strong>Due Date:</strong> {classworkDetails.dueDate}</p>
      <h2 className="text-xl font-semibold">Attachments</h2>
      <ul>
        {classworkDetails?.attachments?.map((attachment) => (
          <li key={attachment.id}>
            <a href={attachment.url} className="text-blue-500 underline">{attachment.fileName}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassworkDetail;
