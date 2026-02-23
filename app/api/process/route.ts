import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

// Type definitions to help structure the data
interface MetricsSummary {
    totalRecords: number;
    themeCounts: Record<string, number>;
    typeCounts: Record<string, number>;
    countryCounts: Record<string, number>;
}

export async function POST(req: Request) {
    try {
        const { release } = await req.json();

        if (!release) {
            return NextResponse.json({ error: 'Release date is required' }, { status: 400 });
        }

        const metricsDir = path.join(process.cwd(), 'metrics', release, 'row_counts');

        if (!fs.existsSync(metricsDir)) {
            return NextResponse.json({ error: `Metrics for release ${release} not found` }, { status: 404 });
        }

        const summary: MetricsSummary = {
            totalRecords: 0,
            themeCounts: {},
            typeCounts: {},
            countryCounts: {},
        };

        // 1. Iterate through themes (directories starting with theme=)
        const themes = fs.readdirSync(metricsDir).filter(f => f.startsWith('theme='));
        const promises: Promise<void>[] = [];

        for (const themeDir of themes) {
            const themeName = themeDir.split('=')[1];
            const themePath = path.join(metricsDir, themeDir);

            // 2. Iterate through types (directories starting with type=)
            const types = fs.readdirSync(themePath).filter(f => f.startsWith('type='));

            for (const typeDir of types) {
                const typeName = typeDir.split('=')[1];
                const typePath = path.join(themePath, typeDir);

                // 3. Find the CSV file (usually part-00000...)
                const files = fs.readdirSync(typePath).filter(f => f.endsWith('.csv'));

                for (const file of files) {
                    const filePath = path.join(typePath, file);

                    promises.push(new Promise((resolve, reject) => {
                        const parser = parse({
                            columns: true,
                            skip_empty_lines: true,
                            relax_quotes: true,
                            relax_column_count: true
                        });

                        parser.on('readable', () => {
                            let record;
                            while ((record = parser.read()) !== null) {
                                if (record.change_type === 'removed') continue;

                                const count = parseInt(record.total_count, 10) || 0;
                                const country = record.country || 'Unknown';

                                // Aggregate totals
                                summary.totalRecords += count;

                                // Aggregate by Theme
                                summary.themeCounts[themeName] = (summary.themeCounts[themeName] || 0) + count;

                                // Aggregate by Type (scoped by theme for clarity, but flat here for simplicity)
                                const fullType = `${themeName}/${typeName}`;
                                summary.typeCounts[fullType] = (summary.typeCounts[fullType] || 0) + count;

                                // Aggregate by Country
                                summary.countryCounts[country] = (summary.countryCounts[country] || 0) + count;
                            }
                        });

                        parser.on('error', reject);
                        parser.on('end', () => resolve());

                        fs.createReadStream(filePath).pipe(parser);
                    }));
                }
            }
        }

        await Promise.all(promises);

        // Sort country counts to keep the payload manageable (Top 50)
        const sortedCountries = Object.fromEntries(
            Object.entries(summary.countryCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 50)
        );
        summary.countryCounts = sortedCountries;


        return NextResponse.json({ success: true, data: summary });

    } catch (error) {
        console.error('Error processing metrics:', error);
        return NextResponse.json({ error: 'Failed to process metrics' }, { status: 500 });
    }
}
