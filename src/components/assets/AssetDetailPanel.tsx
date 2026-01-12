import React from 'react';
import { Box, Typography } from '@mui/material';

export function AssetDetailPanel() {
    return (
        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, minHeight: 400 }}>
            <Typography variant="body2" color="text.secondary">
                Asset Detail Panel (Placeholder)
            </Typography>
        </Box>
    );
}