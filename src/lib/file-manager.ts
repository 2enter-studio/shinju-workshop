import fs from 'fs-extra';

export const init_dir = () => {
	for (const dir of ['mp4', 'images', 'json', 'txt']) {
		fs.ensureDirSync(`./${dir}`);
	}
	const videos = fs.readdirSync('./mp4');
	for (const video of videos) {
		if (video.includes(' ')) {
			const new_name = video.replace(' ', '_');
			fs.renameSync(`./mp4/${video}`, `./mp4/${new_name}`);
			console.log(`Found illegal character ' ', rename from ${video} to ${new_name}`);
		}
	}
};

export const get_frame_count = (video_name: string) => {
	const files = fs.readdirSync(`./images/${video_name}`);
	return files.length;
};

export const get_video_filenames = () => {
	const videos = fs.readdirSync('./mp4');
	console.log(`Found ${videos.length} videos`);

	return videos.map((video_name, i) => {
		console.log(`${i + 1}/${videos.length}:\t${video_name}`);
		const pure_name = video_name.replace('.mp4', '');
		fs.ensureDirSync(`./images/${pure_name}`);
		return pure_name;
	});
};

export const write_json_data = (video: string, data: number[][][]) => {
	fs.writeFileSync(`./json/${video}.json`, JSON.stringify({ data }, null, 4));
	console.log(`Saved json data to ./json/${video}.json`);
};

export const write_pure_string_data = (video: string, data: number[][][]) => {
	const pure_string = data
		.map((frame) => {
			return frame
				.map((row) => {
					return row.join(',');
				})
				.join(',');
		})
		.join('.');
	console.log(pure_string.split('.').length);
	fs.writeFileSync(`./txt/${video}.txt`, pure_string);
	console.log(`Saved pure string data to ./txt/${video}.txt`);
};
