import Jimp from 'jimp';
import { get_frame_count, write_json_data, write_pure_string_data } from './file-manager.js';
import { replace_latest_log } from './utils.js';
import config from '../config.js';

const { compress_rate, max_frame } = config;

class Frame {
	readonly file_name: string;
	image: Jimp | undefined;
	grid: { row: number; col: number };

	constructor(file_name: string) {
		this.file_name = file_name;
		this.grid = {
			row: 0,
			col: 0
		};
	}

	async load() {
		this.image = await Jimp.read(this.file_name);
		// console.log(`Loaded ${this.file_name}`);
	}

	get size() {
		if (this.image === undefined) {
			throw new Error('Image not loaded');
		}
		const { width, height } = this.image.bitmap;
		return { width, height };
	}

	get_pixel_value = (x: number, y: number) => {
		if (this.image === undefined) {
			throw new Error('Image not loaded');
		}
		const hex = this.image.getPixelColor(x, y);
		const { r, g, b } = Jimp.intToRGBA(hex);
		return ~~((r + g + b) / 3);
	};

	get_all_pixel_values = () => {
		if (compress_rate < 0 || compress_rate > 1) {
			throw new Error('Compress rate must be between 0 and 1');
		}

		const { width, height } = this.size;
		const values: number[][] = [];
		const gap = 1 / compress_rate;

		for (let y = 0; y < height; y += gap) {
			const row: number[] = [];
			for (let x = 0; x < width; x += gap) {
				row.push(this.get_pixel_value(x, y));
			}
			values.push(row);
		}
		const row_num = values[0].length;
		const col_num = values.length;
		this.grid = { row: row_num, col: col_num };
		// console.log(`Generated ${row_num}x${col_num} matrix (with total ${row_num * col_num} pixels)`);
		return values;
	};
}

export class ImageSeq {
	video_name: string;
	frames: Frame[] = [];
	frame_count: number;
	time_start: number = 0;
	time_end: number = 0;
	grid: { row: number; col: number } = { row: 0, col: 0 };

	constructor(video_name: string) {
		this.video_name = video_name;
		this.frame_count = get_frame_count(video_name);
		if (this.frame_count > max_frame) this.frame_count = max_frame;
	}

	async load() {
		this.time_start = Date.now();
		for (let i = 1; i < this.frame_count; i++) {
			if (i > max_frame) break;
			const frame = new Frame(`./images/${this.video_name}/${i}.jpg`);
			await frame.load();
			this.frames.push(frame);
			replace_latest_log(`Loaded ${i + 1}/${this.frame_count} frames`);
		}
	}

	get_all_pixel_values = () => {
		const values: number[][][] = [];
		for (const frame of this.frames) {
			values.push(frame.get_all_pixel_values());
			this.grid = frame.grid;
			replace_latest_log(`Processed ${values.length}/${this.frame_count} frames`);
		}
		this.time_end = Date.now();
		const period = (this.time_end - this.time_start) / 1000;
		const { row, col } = this.grid;

		console.log(`\nGenerated image sequence for video ${this.video_name}:`);
		console.log('----------------------');
		console.log(`Total frames:\t${this.frames.length}`);
		console.log(`Pixels per img:\t${row}x${col}=${row * col}`);
		console.log(`Cost time:\t${period} seconds`);
		console.log('----------------------');

		return values;
	};

	calc_json_data_and_save = () => {
		const value = this.get_all_pixel_values();
		write_json_data(this.video_name, this.grid, value);
	};
	calc_pure_string_data_and_save = () => {
		const value = this.get_all_pixel_values();
		write_pure_string_data(this.video_name, this.grid, value);
	};
}
