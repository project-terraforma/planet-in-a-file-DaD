import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const release = searchParams.get('release');
    const format = searchParams.get('format') || 'context'; // default is context.txt

    if (!release) {
        return NextResponse.json({ error: 'Release is required' }, { status: 400 });
    }

    try {
        const contextsDir = path.join(process.cwd(), 'contexts', release);
        const fileName = format === 'context' ? 'context.txt' : `${format}.txt`;
        const filePath = path.join(contextsDir, fileName);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: `Context for release ${release} and format ${format} not found` }, { status: 404 });
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Determine if this release has prototypes
        const hasPrototypes = fs.existsSync(path.join(contextsDir, 'v1_refined.txt'));

        return NextResponse.json({ 
            success: true, 
            content,
            hasPrototypes,
            availableFormats: hasPrototypes ? ['v1_refined', 'v2_hierarchical', 'v3_tabular', 'v4_compressed'] : []
        });
    } catch (error) {
        console.error('Error reading context:', error);
        return NextResponse.json({ error: 'Failed to read context' }, { status: 500 });
    }
}
