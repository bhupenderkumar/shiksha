import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import { supabase } from '../utils/supabaseClient';

const ClassTransitions = () => {
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransitions();
  }, []);

  const fetchTransitions = async () => {
    try {
      const { data: academicYear } = await supabase
        .from('AcademicYear')
        .select('id')
        .eq('status', 'ACTIVE')
        .single();

      const { data, error } = await supabase
        .from('ClassTransition')
        .select(`
          id,
          transition_status,
          transition_date,
          remarks,
          Student:student_id (
            name,
            admissionNumber
          ),
          PreviousClass:previous_class_id (
            name
          ),
          NextClass:next_class_id (
            name
          ),
          YearEndFeedback:YearEndFeedback (
            parent_feedback,
            student_feedback,
            areas_of_improvement,
            strengths
          )
        `)
        .eq('academic_year_id', academicYear.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransitions(data);
    } catch (error) {
      console.error('Error fetching transitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleApproveTransition = async (transitionId) => {
    try {
      const { error } = await supabase
        .from('ClassTransition')
        .update({
          transition_status: 'APPROVED',
          transition_date: new Date().toISOString(),
        })
        .eq('id', transitionId);

      if (error) throw error;
      fetchTransitions();
    } catch (error) {
      console.error('Error approving transition:', error);
    }
  };

  const handleRejectTransition = async (transitionId) => {
    try {
      const { error } = await supabase
        .from('ClassTransition')
        .update({
          transition_status: 'REJECTED',
          transition_date: new Date().toISOString(),
        })
        .eq('id', transitionId);

      if (error) throw error;
      fetchTransitions();
    } catch (error) {
      console.error('Error rejecting transition:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Class Transitions (2024-2025)
        </Typography>

        <Card sx={{ mt: 3 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Admission No.</TableCell>
                  <TableCell>Current Class</TableCell>
                  <TableCell>Next Class</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transitions.map((transition) => (
                  <TableRow key={transition.id}>
                    <TableCell>{transition.Student.name}</TableCell>
                    <TableCell>{transition.Student.admissionNumber}</TableCell>
                    <TableCell>{transition.PreviousClass.name}</TableCell>
                    <TableCell>{transition.NextClass.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={transition.transition_status}
                        color={getStatusColor(transition.transition_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {transition.transition_status === 'PENDING' && (
                        <Box>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleApproveTransition(transition.id)}
                            sx={{ mr: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleRejectTransition(transition.id)}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Container>
  );
};

export default ClassTransitions;
