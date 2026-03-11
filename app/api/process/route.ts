import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
    try {
        const { release } = await req.json();

        if (!release) {
            return NextResponse.json({ error: 'Release date is required' }, { status: 400 });
        }

        // Define paths
        const projectRoot = process.cwd();
        const pythonExecutable = path.join(projectRoot, 'python_pipeline', 'venv', 'bin', 'python');
        const pipelineScript = path.join(projectRoot, 'python_pipeline', 'pipeline.py');
        const contextFilePath = path.join(projectRoot, 'contexts', release, 'context.txt');

        console.log(`Executing pipeline for release: ${release}`);

        // Run the Python pipeline via child_process
        const command = `${pythonExecutable} ${pipelineScript} --month ${release}`;
        
        try {
            const { stdout, stderr } = await execPromise(command, { maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer just in case
            console.log('Pipeline Output:', stdout);
            if (stderr) console.error('Pipeline Stderr:', stderr);
        } catch (execError: any) {
            console.error('Pipeline execution failed:', execError);
            return NextResponse.json({ error: `Pipeline execution failed: ${execError.message}` }, { status: 500 });
        }

        // Check if the context file was successfully generated
        if (!fs.existsSync(contextFilePath)) {
            return NextResponse.json({ error: `Context file was not generated at ${contextFilePath}` }, { status: 500 });
        }

        // Read the result and return it to the frontend
        const generatedContext = fs.readFileSync(contextFilePath, 'utf-8');

        // Note: The frontend page.tsx expects { success: true, data: ... } 
        // We will send the raw generated text as `data` and update page.tsx to handle it directly.
        return NextResponse.json({ success: true, data: generatedContext });

    } catch (error) {
        console.error('Error processing metrics:', error);
        return NextResponse.json({ error: 'Failed to process metrics' }, { status: 500 });
    }
}
