import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { FiltersBar } from '../components/assets/FiltersBar';
import { AssetTable } from '../components/assets/AssetTable';
import { AssetDetailPanel } from '../components/assets/AssetDetailPanel';

export default function AssetConsolePage() {
    return (
        <MainLayout 
            filters={<FiltersBar />}
            table={<AssetTable />}
            detail={<AssetDetailPanel />}
        />
    )
}