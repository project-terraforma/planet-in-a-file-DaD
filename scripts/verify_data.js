const fs = require('fs');
const path = require('path');
const { parse: parseSync } = require('csv-parse/sync');
const { parse } = require('csv-parse');

const RELEASE = '2025-01-22.0';

async function verify() {
    console.log(`Verifying Release: ${RELEASE}`);

    // 1. Calculate Expected Counts from theme_column_summary_stats
    // Adjusted path to go up two levels from scripts/ (dashboards-are-dead-app -> Project Root)
    const summaryStatsDir = path.join(__dirname, '../../theme_column_summary_stats');

    if (!fs.existsSync(summaryStatsDir)) {
        console.error(`❌ ERROR: Summary stats directory not found at ${summaryStatsDir}`);
        return;
    }

    const summaryFiles = fs.readdirSync(summaryStatsDir).filter(f => f.startsWith(RELEASE) && f.endsWith('.csv'));

    let expectedTotal = 0;
    const expectedThemeCounts = {};

    console.log('--- EXPECTED (from summary stats) ---');
    for (const file of summaryFiles) {
        const content = fs.readFileSync(path.join(summaryStatsDir, file), 'utf-8');
        const records = parseSync(content, {
            columns: true,
            skip_empty_lines: true,
            relax_quotes: true,
            relax_column_count: true
        });

        // The summary stats file has one row per type usually
        for (const record of records) {
            const count = parseInt(record.total_count, 10);
            expectedTotal += count;

            const theme = record.theme;
            expectedThemeCounts[theme] = (expectedThemeCounts[theme] || 0) + count;
        }
    }
    console.log(`Total Records: ${expectedTotal.toLocaleString()}`);
    console.log('By Theme:', expectedThemeCounts);

    // 2. Calculate Actual Counts from row_counts (Simulating the App's Logic)
    console.log('\n--- ACTUAL (from row_counts aggregation) ---');

    const metricsDir = path.join(__dirname, '../../metrics', RELEASE, 'row_counts');

    if (!fs.existsSync(metricsDir)) {
        console.error(`❌ ERROR: Metrics directory not found at ${metricsDir}`);
        return;
    }

    let actualTotal = 0;
    const actualThemeCounts = {};

    const themes = fs.readdirSync(metricsDir).filter(f => f.startsWith('theme='));
    const promises = [];

    for (const themeDir of themes) {
        const themeName = themeDir.split('=')[1];
        const themePath = path.join(metricsDir, themeDir);
        const types = fs.readdirSync(themePath).filter(f => f.startsWith('type='));

        for (const typeDir of types) {
            const typePath = path.join(themePath, typeDir);
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

                    let fileTotal = 0;
                    parser.on('readable', function () {
                        let record;
                        while ((record = parser.read()) !== null) {
                            if (record.change_type === 'removed') continue;
                            const count = parseInt(record.total_count, 10) || 0;
                            fileTotal += count;
                        }
                    });

                    parser.on('error', function (err) {
                        reject(err);
                    });

                    parser.on('end', function () {
                        actualTotal += fileTotal;
                        actualThemeCounts[themeName] = (actualThemeCounts[themeName] || 0) + fileTotal;
                        resolve();
                    });

                    fs.createReadStream(filePath).pipe(parser);
                }));
            }
        }
    }

    await Promise.all(promises);

    console.log(`Total Records: ${actualTotal.toLocaleString()}`);
    console.log('By Theme:', actualThemeCounts);

    // 3. Compare
    console.log('\n--- VERIFICATION RESULT ---');
    const diff = Math.abs(expectedTotal - actualTotal);
    const percentDiff = (expectedTotal > 0) ? (diff / expectedTotal) * 100 : 0;

    if (percentDiff < 2.0) {
        console.log(`✅ SUCCESS: Discrepancy is ${percentDiff.toFixed(4)}% (< 2%)`);
    } else {
        console.error(`❌ FAILURE: Discrepancy is ${percentDiff.toFixed(4)}% (> 2%)`);
    }
}

verify().catch(console.error);
