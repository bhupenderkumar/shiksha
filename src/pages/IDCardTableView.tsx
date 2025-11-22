import React, { useEffect, useState } from 'react';
import { idCardService, IDCardData } from '@/services/idCardService';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const IDCardTableView = () => {
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
      <Card>
        <CardHeader>
          <CardTitle>ID Cards - Table View</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Father's Name</TableHead>
                <TableHead>Father's Mobile</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {idCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>{card.student_name}</TableCell>
                  <TableCell>{card.class_id}</TableCell>
                  <TableCell>{card.father_name}</TableCell>
                  <TableCell>{card.father_mobile}</TableCell>
                  <TableCell>
                    <Link to={`/id-card?id=${card.id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default IDCardTableView;