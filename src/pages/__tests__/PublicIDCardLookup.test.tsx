import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PublicIDCardLookup, { maskValue, maskMobile, maskAddress, formatDate } from '../PublicIDCardLookup';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderComponent() {
  return render(
    <BrowserRouter>
      <PublicIDCardLookup />
    </BrowserRouter>
  );
}

// ============================================================
// UNIT TESTS: Masking / Formatting functions
// ============================================================

describe('maskValue', () => {
  it('returns dots for null/undefined', () => {
    expect(maskValue(null)).toBe('••••');
    expect(maskValue(undefined)).toBe('••••');
  });

  it('returns all dots for empty string', () => {
    expect(maskValue('')).toBe('••••');
  });

  it('masks string longer than visibleChars', () => {
    expect(maskValue('Rajesh Sharma', 4)).toBe('Raje•••••••••');
  });

  it('returns all dots when value length <= visibleChars', () => {
    expect(maskValue('Hi', 3)).toBe('••');
    expect(maskValue('Ram', 3)).toBe('•••');
  });

  it('uses default visibleChars of 3', () => {
    expect(maskValue('Hello')).toBe('Hel••');
  });
});

describe('maskMobile', () => {
  it('returns dots for null/undefined', () => {
    expect(maskMobile(null)).toBe('••••••••••');
    expect(maskMobile(undefined)).toBe('••••••••••');
  });

  it('masks full 10-digit number showing last 4', () => {
    expect(maskMobile('9876543210')).toBe('••••••3210');
  });

  it('handles numbers with country code +91', () => {
    expect(maskMobile('+91-9876543210')).toBe('••••••••3210');
  });

  it('returns all dots for short numbers (<=4 digits)', () => {
    expect(maskMobile('1234')).toBe('••••');
    expect(maskMobile('123')).toBe('•••');
  });

  it('handles empty string', () => {
    expect(maskMobile('')).toBe('••••••••••');
  });
});

describe('maskAddress', () => {
  it('returns dots for null/undefined', () => {
    expect(maskAddress(null)).toBe('••••••••');
    expect(maskAddress(undefined)).toBe('••••••••');
  });

  it('shows first 2 words + dots for multi-word address', () => {
    expect(maskAddress('Saurabh Vihar Delhi 110044')).toBe('Saurabh Vihar ••••');
  });

  it('masks short addresses (<=2 words) with maskValue', () => {
    expect(maskAddress('Delhi')).toBe('Del••');
  });

  it('handles 2-word address with maskValue', () => {
    expect(maskAddress('New Delhi')).toBe('New••••••');
  });

  it('handles empty string', () => {
    expect(maskAddress('')).toBe('••••••••');
  });
});

describe('formatDate', () => {
  it('returns "Not available" for null/undefined', () => {
    expect(formatDate(null)).toBe('Not available');
    expect(formatDate(undefined)).toBe('Not available');
  });

  it('formats a valid date string', () => {
    const result = formatDate('2018-05-15');
    expect(result).toContain('2018');
    expect(result).toContain('May');
  });

  it('returns "Not available" for empty string', () => {
    expect(formatDate('')).toBe('Not available');
  });
});

// ============================================================
// COMPONENT TESTS: PublicIDCardLookup (Landing Page)
// ============================================================

describe('PublicIDCardLookup', () => {
  it('renders school header', () => {
    renderComponent();
    expect(screen.getByText('First Step School')).toBeInTheDocument();
    expect(screen.getByText('Student ID Card Portal')).toBeInTheDocument();
  });

  it('renders info banner about filling latest details', () => {
    renderComponent();
    expect(screen.getByText(/latest details/)).toBeInTheDocument();
  });

  it('renders new student card with button', () => {
    renderComponent();
    expect(screen.getByText('New Student')).toBeInTheDocument();
    expect(screen.getByText('Fill ID Card Form')).toBeInTheDocument();
  });

  it('renders existing student update card with button', () => {
    renderComponent();
    expect(screen.getByText(/Existing Student/)).toBeInTheDocument();
    expect(screen.getByText('Update ID Card Details')).toBeInTheDocument();
  });

  it('navigates to /id-card/new on "Fill ID Card Form" click', async () => {
    renderComponent();
    const user = userEvent.setup();
    await user.click(screen.getByText('Fill ID Card Form'));
    expect(mockNavigate).toHaveBeenCalledWith('/id-card/new');
  });

  it('navigates to /id-card/new on "Update ID Card Details" click', async () => {
    renderComponent();
    const user = userEvent.setup();
    await user.click(screen.getByText('Update ID Card Details'));
    expect(mockNavigate).toHaveBeenCalledWith('/id-card/new');
  });

  it('sets document title on mount', () => {
    renderComponent();
    expect(document.title).toBe('First Step School - ID Card Portal');
  });
});
