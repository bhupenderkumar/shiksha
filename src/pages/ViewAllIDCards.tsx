import React, { useEffect, useState } from 'react';
import { idCardService, IDCardData } from '@/services/idCardService';
import { Link } from 'react-router-dom';

const ViewAllIDCards = () => {
  const [idCards, setIdCards] = useState<IDCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIDCards = async () => {
      try {
        const cards = await idCardService.getAll();
        setIdCards(cards);
      } catch (error) {
        console.error('Error fetching ID cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIDCards();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All ID Cards</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {idCards.map((card) => (
          <Link to={`/id-card?studentId=${card.id}`} key={card.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <img src={card.student_photo_url || ''} alt={card.student_name} className="w-full h-48 object-cover rounded-md mb-2" />
            <h2 className="text-lg font-semibold">{card.student_name}</h2>
            <p className="text-gray-600">{card.class_id}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ViewAllIDCards;