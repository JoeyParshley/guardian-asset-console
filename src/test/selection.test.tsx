import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from './utils';
import { AssetDetailPanel } from '../components/assets/AssetDetailPanel';
import { db } from '../api/db';
import { setClientConfig } from '../api/client';

describe('Asset Selection and Detail Updates', () => {
  beforeEach(() => {
    // Reset database and set client config
    db.reset();
    setClientConfig({ role: 'operator', userId: 'user-001' });
  });

  it('shows placeholder when no asset is selected', () => {
    render(<AssetDetailPanel assetId={null} />);

    expect(screen.getByText('Select an asset to view details')).toBeInTheDocument();
  });

  it('loads and displays asset details when asset is selected', async () => {
    // Get first asset from database
    const assets = db.getAssets();
    const asset = assets[0];

    render(<AssetDetailPanel assetId={asset.id} />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(asset.name)).toBeInTheDocument();
    });

    // Check tag ID is displayed
    expect(screen.getByText(asset.tagId)).toBeInTheDocument();

    // Check site is displayed
    expect(screen.getByText(asset.site)).toBeInTheDocument();
  });

  it('displays activity timeline section', async () => {
    const assets = db.getAssets();
    const asset = assets[0];

    render(<AssetDetailPanel assetId={asset.id} />);

    await waitFor(() => {
      expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
    });
  });

  it('displays asset details section with statistics', async () => {
    const assets = db.getAssets();
    const asset = assets[0];

    render(<AssetDetailPanel assetId={asset.id} />);

    await waitFor(() => {
      expect(screen.getByText('Asset Details')).toBeInTheDocument();
    });

    // Check for statistics labels
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Total Scans')).toBeInTheDocument();
    expect(screen.getByText('Total Incidents')).toBeInTheDocument();
  });

  it('shows loading state while fetching', () => {
    const assets = db.getAssets();
    const asset = assets[0];

    render(<AssetDetailPanel assetId={asset.id} />);

    // Initially should show loading indicator (CircularProgress)
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('updates when selected asset changes', async () => {
    const assets = db.getAssets();
    const asset1 = assets[0];
    const asset2 = assets[1];

    const { rerender } = render(<AssetDetailPanel assetId={asset1.id} />);

    // Wait for first asset to load
    await waitFor(() => {
      expect(screen.getByText(asset1.name)).toBeInTheDocument();
    });

    // Change to second asset
    rerender(<AssetDetailPanel assetId={asset2.id} />);

    // Wait for second asset to load
    await waitFor(() => {
      expect(screen.getByText(asset2.name)).toBeInTheDocument();
    });

    // First asset name should no longer be visible
    expect(screen.queryByText(asset1.name)).not.toBeInTheDocument();
  });
});
