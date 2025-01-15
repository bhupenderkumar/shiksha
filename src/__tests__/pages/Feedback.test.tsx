import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Feedback } from '@/pages/Feedback';
import { feedbackService } from '@/services/feedbackService';
import { toast } from 'react-toastify';

// Mock the dependencies
vi.mock('@/services/feedbackService');
vi.mock('react-toastify');

describe('Feedback Component', () => {
  const mockFeedback = {
    id: 1,
    title: 'Test Feedback',
    description: 'Test Description',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('viewFeedbackDetails', () => {
    it('should successfully load and display feedback details', async () => {
      // Mock the getById function
      (feedbackService.getById as any).mockResolvedValue(mockFeedback);

      // Render the component
      render(<Feedback />);

      // Find and click the view details button
      const viewButton = screen.getByTestId('view-feedback-1');
      fireEvent.click(viewButton);

      // Wait for the feedback details to be loaded
      await waitFor(() => {
        expect(feedbackService.getById).toHaveBeenCalledWith(1);
      });

      // Verify the feedback details are displayed
      expect(screen.getByText(mockFeedback.title)).toBeInTheDocument();
      expect(screen.getByText(mockFeedback.description)).toBeInTheDocument();
    });

    it('should handle errors when loading feedback details', async () => {
      // Mock the error case
      const error = new Error('Failed to load feedback');
      (feedbackService.getById as any).mockRejectedValue(error);

      // Render the component
      render(<Feedback />);

      // Find and click the view details button
      const viewButton = screen.getByTestId('view-feedback-1');
      fireEvent.click(viewButton);

      // Wait for the error handling
      await waitFor(() => {
        expect(feedbackService.getById).toHaveBeenCalledWith(1);
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to load feedback details. Please try again.'
        );
      });
    });

    it('should set loading state while fetching feedback details', async () => {
      // Mock a delayed response
      (feedbackService.getById as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockFeedback), 100))
      );

      // Render the component
      render(<Feedback />);

      // Find and click the view details button
      const viewButton = screen.getByTestId('view-feedback-1');
      fireEvent.click(viewButton);

      // Check if loading state is set
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Wait for the loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });
});
