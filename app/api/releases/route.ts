import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const metricsDir = path.join(process.cwd(), 'metrics');

    try {
        if (!fs.existsSync(metricsDir)) {
            // Try resolving relative to the app directory if run in a different context
            return NextResponse.json({ error: 'Metrics directory not found' }, { status: 404 });
        }

        const files = fs.readdirSync(metricsDir);
        // Filter for directories that look like dates (YYYY-MM-DD.V)
        const releases = files.filter(file => {
            try {
                const stats = fs.statSync(path.join(metricsDir, file));
                return stats.isDirectory() && /^\d{4}-\d{2}-\d{2}\.\d+$/.test(file);
            } catch (e) {
                return false;
            }
        }).sort().reverse(); // Newest first

        return NextResponse.json({ releases });
    } catch (error) {
        console.error('Error reading metrics directory:', error);
        return NextResponse.json({ error: 'Failed to list releases' }, { status: 500 });
    }
}
