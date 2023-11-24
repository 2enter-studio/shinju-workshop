import { video_to_images } from './lib/video-to-images.js';
import { get_video_filenames, init_dir } from './lib/file-manager.js';
import { ImageSeq } from './lib/image-processor.js';
import fs from 'fs-extra';
import { replace_latest_log } from './lib/utils.js';

init_dir();
const video_names = get_video_filenames();

// for (const video_name of video_names) {
// 	console.log(`Processing ${video_name}`);
// 	await video_to_images(`./mp4/${video_name}.mp4`, `./images/${video_name}`);
// }
//
for (const video_name of video_names) {
	if (fs.readdirSync(`./txt`).includes(`${video_name}.txt`)) {
		// console.log(`Skipping ${video_name}`);
		replace_latest_log(`Skipping ${video_name}`);
		continue;
	}
	const image_seq = new ImageSeq(video_name);

	console.log(`\nLoading image sequences for "${video_name}"`);

	await image_seq.load();
	image_seq.calc_pure_string_data_and_save();
	console.log();
}
