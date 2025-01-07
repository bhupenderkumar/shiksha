import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchClassworkDetails } from '@/services/classworkService';

const ClassworkView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classworkDetails, setClassworkDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const getClassworkDetails = async () => {
      try {
        const data = await fetchClassworkDetails(id);
        setClassworkDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getClassworkDetails();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-500">Back</button>
      <h1 className="text-2xl font-bold">{classworkDetails.title}</h1>
      <p>{classworkDetails.description}</p>
      <p><strong>Due Date:</strong> {classworkDetails.dueDate}</p>
      <h2 className="text-xl font-semibold">Attachments</h2>
      <ul>
        {classworkDetails.attachments?.map((attachment) => (
          <li key={attachment.id}>
            <a href={attachment.filePath} className="text-blue-500 underline">{attachment.fileName}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassworkView;
