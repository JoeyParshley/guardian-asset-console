import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from './utils';
import userEvent from '@testing-library/user-event';
import { FiltersBar } from '../components/assets/FiltersBar';
import { db } from '../api/db';
import type { AssetStatus, Severity } from '../domain/types';

describe('Asset Filtering', () => {
  beforeEach(() => {
    // Reset database to seed data before each test
    db.reset();
  });

  it('renders all filter controls', () => {
    const mockProps = {
      search: '',
      status: [] as AssetStatus[],
      severity: [] as Severity[],
      site: '',
      sites: ['Site A', 'Site B'],
      onSearchChange: () => {},
      onStatusChange: () => {},
      onSeverityChange: () => {},
      onSiteChange: () => {},
      onClear: () => {},
    };

    render(<FiltersBar {...mockProps} />);

    // Check search input exists
    expect(screen.getByPlaceholderText('Search assets...')).toBeInTheDocument();

    // Check filter dropdowns exist
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Severity')).toBeInTheDocument();
    expect(screen.getByLabelText('Site')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search input', async () => {
    const user = userEvent.setup();
    let searchValue = '';

    const mockProps = {
      search: '',
      status: [] as AssetStatus[],
      severity: [] as Severity[],
      site: '',
      sites: ['Site A', 'Site B'],
      onSearchChange: (value: string) => {
        searchValue = value;
      },
      onStatusChange: () => {},
      onSeverityChange: () => {},
      onSiteChange: () => {},
      onClear: () => {},
    };

    render(<FiltersBar {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('Search assets...');
    await user.type(searchInput, 'test');

    // Wait for debounce
    await waitFor(
      () => {
        expect(searchValue).toBe('test');
      },
      { timeout: 500 }
    );
  });

  it('shows Clear button when filters are active', () => {
    const mockProps = {
      search: 'test',
      status: [] as AssetStatus[],
      severity: [] as Severity[],
      site: '',
      sites: ['Site A', 'Site B'],
      onSearchChange: () => {},
      onStatusChange: () => {},
      onSeverityChange: () => {},
      onSiteChange: () => {},
      onClear: () => {},
    };

    render(<FiltersBar {...mockProps} />);

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('hides Clear button when no filters are active', () => {
    const mockProps = {
      search: '',
      status: [] as AssetStatus[],
      severity: [] as Severity[],
      site: '',
      sites: ['Site A', 'Site B'],
      onSearchChange: () => {},
      onStatusChange: () => {},
      onSeverityChange: () => {},
      onSiteChange: () => {},
      onClear: () => {},
    };

    render(<FiltersBar {...mockProps} />);

    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('calls onClear when Clear button is clicked', async () => {
    const user = userEvent.setup();
    let clearCalled = false;

    const mockProps = {
      search: 'test',
      status: [] as AssetStatus[],
      severity: [] as Severity[],
      site: '',
      sites: ['Site A', 'Site B'],
      onSearchChange: () => {},
      onStatusChange: () => {},
      onSeverityChange: () => {},
      onSiteChange: () => {},
      onClear: () => {
        clearCalled = true;
      },
    };

    render(<FiltersBar {...mockProps} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(clearCalled).toBe(true);
  });
});
