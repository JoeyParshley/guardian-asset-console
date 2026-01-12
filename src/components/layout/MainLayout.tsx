import React from 'react';
import { Box } from '@mui/material';

/**
 * Master/detail page layout component
 *
 */

interface MainLayoutProps {
    filters: React.ReactNode;
    table: React.ReactNode;
    detail: React.ReactNode;
}

export function MainLayout({ filters, table, detail }: MainLayoutProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Filters bar at the top */}
            <Box sx={{ mb: 2, flexShrink: 0 }}>
                {filters}
            </Box>

            {/* Main content: table and detail side by side */}
            <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, minHeight: 0, overflow: 'hidden', width: '100%' }}>
                {/* Left Asset table */}
                <Box sx={{ flex: '1 1 58.33%', minWidth: 0, overflow: 'auto' }}>
                    {table}
                </Box>

                {/* Right Detail panel */}
                <Box sx={{ flex: '1 1 41.67%', minWidth: 0, overflow: 'auto' }}>
                    {detail}
                </Box>
            </Box>
        </Box>
    );
}