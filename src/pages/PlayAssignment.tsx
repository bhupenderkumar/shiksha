import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interactiveAssignmentService } from '@/services/interactiveAssignmentService';
import AssignmentPlayer from './AssignmentPlayer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';

export default function PlayAssignment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!id) {
        setError('Invalid link');
        setLoading(false);
        return;
      }

      console.log('Fetching assignment with shared link ID:', id);

      try {
        // Clean the token - remove any path components or URL parts
        const token = id.split('/').pop() || id;
        console.log('Cleaned token for lookup:', token);

        // Get assignment by shareable link using our encrypted token approach
        console.log('Attempting to get assignment with token:', token);
        const data = await interactiveAssignmentService.getByShareableLink(token);
        console.log('Response from getByShareableLink:', data);

        if (!data) {
          console.error('Assignment not found for token:', token);

          // If we haven't retried yet, try one more time after a short delay
          if (retryCount < 1) {
            console.log('Retrying after a short delay...');
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000);
            return;
          }

          setError('Assignment not found or link has expired');
          setLoading(false);
          return;
        }

        console.log('Assignment found, setting assignment ID:', data.id);
        // Instead of redirecting, set the assignment ID and render the AssignmentPlayer
        setAssignmentId(data.id.toString());
        setAssignment(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError('Failed to load assignment');
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id, navigate, retryCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <CardContent>
            <p className="text-gray-500 mb-4">{error}</p>
            <div className="flex flex-col space-y-4 items-center">
              <Button onClick={() => navigate('/')}>
                Go to Home
              </Button>
              <Button variant="outline" onClick={() => navigate('/interactive-assignments')}>
                View All Assignments
              </Button>
              <p className="text-sm text-gray-400 mt-4">
                If you received this link from someone, please ask them to share it again.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the AssignmentPlayer directly with the assignment ID
  if (assignmentId) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
        {/* Optional: Add a small header for anonymous users */}
        <div className="bg-blue-600 text-white p-2 text-center text-sm">
          You're playing an interactive assignment. Have fun!
        </div>
        <AssignmentPlayer assignmentId={assignmentId} isPlayMode={true} />
      </div>
    );
  }

  return null;
}
