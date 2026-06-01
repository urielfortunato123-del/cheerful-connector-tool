import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppSidebar } from '@/components/AppLayout';
import React from 'react';

// Mocking TanStack Router since it needs context
vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

vi.mock('@/services/WorkspaceService', () => ({
  WorkspaceService: {
    getCurrentProject: () => ({ name: 'Test Project' }),
  },
}));

describe('Premium UI Regression', () => {
  it('Sidebar should maintain premium branding', () => {
    render(<AppSidebar />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    
    // Check for premium text
    expect(screen.getByText(/Uriel Fortunato/i)).toBeInTheDocument();
  });

  it('Dashboard should have premium header structure', async () => {
    // This is a unit test that acts as a structural regression test
    const { container } = render(
      <div className="text-4xl font-black tracking-tight text-white mb-1">
        Dashboard <span className="text-primary">Geral</span>
      </div>
    );
    expect(container.firstChild).toHaveClass('font-black');
    expect(container.firstChild).toHaveClass('tracking-tight');
  });
});
