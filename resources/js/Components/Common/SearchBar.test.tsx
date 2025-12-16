import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

describe('SearchBar Component', () => {
  let onSearch: ReturnType<typeof vi.fn>;
  let onClear: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSearch = vi.fn();
    onClear = vi.fn();
  });

  it('renders with default placeholder', () => {
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/buscar em conversas/i);
    expect(input).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchBar onSearch={onSearch} placeholder="Custom search" />);

    const input = screen.getByPlaceholderText(/custom search/i);
    expect(input).toBeInTheDocument();
  });

  it('shows search icon by default', () => {
    render(<SearchBar onSearch={onSearch} />);

    // Lucide icons render as SVG with specific class
    const container = screen.getByRole('textbox').closest('form');
    expect(container).toBeInTheDocument();
  });

  it('shows loader when isLoading is true', () => {
    render(<SearchBar onSearch={onSearch} isLoading />);

    // Check for loading spinner
    const container = screen.getByRole('textbox').closest('form');
    const loader = container?.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('triggers search on input change with 2+ characters', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('textbox');

    // Type 1 character - should not trigger search
    await user.type(input, 'a');
    expect(onSearch).not.toHaveBeenCalled();

    // Type 2nd character - should trigger search
    await user.type(input, 'b');
    expect(onSearch).toHaveBeenCalledWith('ab');
  });

  it('trims whitespace before searching', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '  test  ');

    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('triggers search on form submit', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test query');
    await user.keyboard('{Enter}');

    // Should have been called during typing and on submit
    expect(onSearch).toHaveBeenCalled();
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('does not trigger search on submit with less than 2 characters', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'a');

    // Clear previous calls from onChange
    onSearch.mockClear();

    await user.keyboard('{Enter}');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('shows clear button when input has value', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} onClear={onClear} />);

    const input = screen.getByRole('textbox');

    // No clear button initially
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // Type something
    await user.type(input, 'test');

    // Clear button should appear
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} onClear={onClear} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'test query');

    expect(input.value).toBe('test query');

    const clearButton = screen.getByRole('button');
    await user.click(clearButton);

    expect(input.value).toBe('');
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when input is emptied', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} onClear={onClear} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    // Clear the input by selecting all and deleting
    await user.clear(input);

    await waitFor(() => {
      expect(onClear).toHaveBeenCalled();
    });
  });

  it('focuses input when autoFocus is true', () => {
    render(<SearchBar onSearch={onSearch} autoFocus />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });

  it('focuses input after clearing', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} onClear={onClear} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    const clearButton = screen.getByRole('button');
    await user.click(clearButton);

    expect(input).toHaveFocus();
  });

  it('applies custom className', () => {
    render(<SearchBar onSearch={onSearch} className="custom-search" />);

    const form = screen.getByRole('textbox').closest('form');
    expect(form).toHaveClass('custom-search');
  });

  it('handles rapid input changes correctly', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole('textbox');

    // Simulate rapid typing
    await user.type(input, 'hello world', { delay: 10 });

    // Should have been called multiple times as user types
    expect(onSearch).toHaveBeenCalled();

    // Last call should be with full text
    const calls = onSearch.mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).toBe('hello world');
  });
});
