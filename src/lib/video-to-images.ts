import { spawn } from 'child_process';
import path from 'path';

import { replace_latest_log } from './utils.js';
import config from '../config.js';

const { fps } = config;
const generate_command = (input_file: string, output_dir: string) => {
	const output_file = path.join(output_dir, '%d.jpg');
	return `ffmpeg -i ${input_file} -vf fps=${fps} ${output_file}`;
};

export const video_to_images = (input_file: string, output_dir: string) => {
	const command = generate_command(input_file, output_dir);

	return new Promise((resolve) => {
		const child = spawn(command, { shell: true });
		// child.stdout.on('data', (data: string) => {
		// console.log(`${data}`);
		// });
		child.stderr.on('data', (data: string) => {
			// console.error(`Error: ${data}`);
			replace_latest_log(
				`Error: Some error occurred when processing ${input_file} to ${output_dir}`
			);
			// console.error(`Error: Some error occurred when processing ${input_file} to ${output_dir}`);
		});
		child.on('close', (code: number) => {
			console.log(`child process exited with code ${code}\n`);
			resolve(null);
		});
		child.stdin.end();
	});
};
