import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InteractiveAssignmentForm } from '../InteractiveAssignmentForm';
import { vi } from 'vitest';

describe('InteractiveAssignmentForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with basic fields', () => {
    render(<InteractiveAssignmentForm {...defaultProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/difficulty level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estimated time/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<InteractiveAssignmentForm {...defaultProps} />);

    fireEvent.click(screen.getByText(/save assignment/i));

    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('handles question addition and removal', async () => {
    render(<InteractiveAssignmentForm {...defaultProps} />);

    // Add a question
    fireEvent.click(screen.getByText(/add question/i));
    
    await waitFor(() => {
      expect(screen.getByText(/matching/i)).toBeInTheDocument();
    });

    // Remove the question
    fireEvent.click(screen.getByLabelText(/remove question/i));

    await waitFor(() => {
      expect(screen.queryByText(/matching/i)).not.toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    render(<InteractiveAssignmentForm {...defaultProps} />);

    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/title/i), 'Test Assignment');
    await userEvent.type(screen.getByLabelText(/description/i), 'This is a test assignment description');
    
    // Add a question
    fireEvent.click(screen.getByText(/add question/i));
    
    // Submit the form
    fireEvent.click(screen.getByText(/save assignment/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Assignment',
          description: 'This is a test assignment description',
          questions: expect.any(Array)
        }),
        'draft'
      );
    });
  });
});