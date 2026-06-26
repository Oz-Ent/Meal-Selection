import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Report } from './Report';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

jest.mock('jspdf');
jest.mock('jspdf-autotable');

describe('Report Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock for jsPDF instance
        (jsPDF as unknown as jest.Mock).mockImplementation(() => ({
            text: jest.fn(),
            save: jest.fn()
        }));
    });

    it('renders report data', () => {
        render(
            <MemoryRouter>
                <Report />
            </MemoryRouter>
        );

        expect(screen.getByText('Monday')).toBeInTheDocument();
        expect(screen.getByText('Tuesday')).toBeInTheDocument();
        expect(screen.getByText('16 responses')).toBeInTheDocument(); // Monday total
        expect(screen.getByText('indomie noodles fried egg and Sausages- chopped kpakpo shito')).toBeInTheDocument();
    });

    it('filters data when day is selected', async () => {
        render(
            <MemoryRouter>
                <Report />
            </MemoryRouter>
        );

        // Open filter dropdown
        const filterDropdown = screen.getByText('All');
        fireEvent.click(filterDropdown);

        // Select Monday
        const mondayOption = screen.getAllByText('Monday').find(el => el.tagName.toLowerCase() === 'div');
        if (mondayOption) {
            fireEvent.click(mondayOption);
        }

        // Should still show Monday
        expect(screen.getAllByText('Monday').length).toBeGreaterThan(0);
        
        // Should not show Tuesday's data
        await waitFor(() => {
            expect(screen.queryByText('14 responses')).not.toBeInTheDocument();
        });
    });

    it('triggers export PDF', () => {
        render(
            <MemoryRouter>
                <Report />
            </MemoryRouter>
        );

        const exportBtn = screen.getByRole('button', { name: /export/i });
        fireEvent.click(exportBtn);

        expect(jsPDF).toHaveBeenCalledTimes(1);
        expect(autoTable).toHaveBeenCalledTimes(1);
    });
});
