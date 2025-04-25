import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatchingQuestionForm } from '../question-forms/MatchingQuestionForm';
import { vi } from 'vitest';

describe('MatchingQuestionForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    initialData: {
      type: 'MATCHING',
      points: 1,
      content: {
        instruction: '',
        leftItems: [],
        rightItems: []
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Initial Rendering
  it('renders with initial data when provided', () => {
    const initialData = {
      type: 'MATCHING',
      points: 2,
      content: {
        instruction: 'Initial instruction',
        leftItems: [{ id: '1', text: 'Left 1' }],
        rightItems: [{ id: '1', text: 'Right 1' }]
      }
    };

    render(<MatchingQuestionForm {...defaultProps} initialData={initialData} />);

    expect(screen.getByLabelText(/instruction/i)).toHaveValue('Initial instruction');
    expect(screen.getByLabelText(/points/i)).toHaveValue('2');
  });

  // Test 2: Form Validation
  it('displays validation errors for invalid data', async () => {
    render(<MatchingQuestionForm {...defaultProps} />);

    // Submit empty form
    fireEvent.click(screen.getByText(/save question/i));

    await waitFor(() => {
      expect(screen.getByText(/instruction is required/i)).toBeInTheDocument();
      expect(screen.getByText(/at least 2 items are required/i)).toBeInTheDocument();
    });
  });

  // Test 3: Item Management
  it('manages items correctly', async () => {
    render(<MatchingQuestionForm {...defaultProps} />);

    // Add items
    const addLeftItem = screen.getByText(/add left item/i);
    const addRightItem = screen.getByText(/add right item/i);

    fireEvent.click(addLeftItem);
    fireEvent.click(addRightItem);

    // Verify new items are added
    expect(screen.getAllByPlaceholderText(/enter item text/i)).toHaveLength(4);

    // Fill in items
    const itemInputs = screen.getAllByPlaceholderText(/enter item text/i);
    await userEvent.type(itemInputs[0], 'Left Item 1');
    await userEvent.type(itemInputs[1], 'Right Item 1');
    await userEvent.type(itemInputs[2], 'Left Item 2');
    await userEvent.type(itemInputs[3], 'Right Item 2');

    // Remove an item
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);

    // Verify item was removed
    expect(screen.getAllByPlaceholderText(/enter item text/i)).toHaveLength(3);
  });

  // Test 4: Complete Form Submission
  it('submits form with complete data', async () => {
    render(<MatchingQuestionForm {...defaultProps} />);

    // Fill instruction
    await userEvent.type(screen.getByLabelText(/instruction/i), 'Match these items');

    // Set points
    await userEvent.clear(screen.getByLabelText(/points/i));
    await userEvent.type(screen.getByLabelText(/points/i), '3');

    // Add and fill items
    const itemInputs = screen.getAllByPlaceholderText(/enter item text/i);
    await userEvent.type(itemInputs[0], 'Dog');
    await userEvent.type(itemInputs[1], 'Woof');

    // Submit form
    fireEvent.click(screen.getByText(/save question/i));

    // Verify submission
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'MATCHING',
          points: 3,
          content: {
            instruction: 'Match these items',
            leftItems: [{ text: 'Dog', id: expect.any(String) }],
            rightItems: [{ text: 'Woof', id: expect.any(String) }]
          }
        })
      );
    });
  });

  // Test 5: Cancel Operation
  it('calls onCancel when cancel button is clicked', () => {
    render(<MatchingQuestionForm {...defaultProps} />);
    
    fireEvent.click(screen.getByText(/cancel/i));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
