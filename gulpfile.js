const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const plumber = require('gulp-plumber');
const htmlMinify = require('html-minifier');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const postcssCombineMediaQuery = require('postcss-combine-media-query');
const cssnano = require('cssnano');
const del = require('del');
const concatcss = require('gulp-concat-css');
// const concat = require('gulp-concat');
const imagecomp = require('compress-images');

function serve() {
	browserSync.init({
		server: { baseDir: './dist' },
		notify: false,
	});
}

function source() {
	return src('src/source/**/*')
		.pipe(plumber())
		.pipe(dest('dist/'))
		.pipe(browserSync.reload({ stream: true }));
}

function html() {
	const options = {
		includeAutoGeneratedTags: true,
		removeAttributeQuotes: true,
		removeComments: true,
		removeRedundantAttributes: true,
		removeScriptTypeAttributes: true,
		removeStyleLinkTypeAttributes: true,
		sortClassName: true,
		useShortDoctype: true,
		collapseWhitespace: true,
		minifyCSS: true,
		keepClosingSlash: true,
	};

	return src('src/**/*.html')
		.pipe(plumber())
		.on('data', function (file) {
			const buferFile = Buffer.from(
				htmlMinify.minify(file.contents.toString(), options),
			);
			return (file.contents = buferFile);
		})
		.pipe(dest('dist/'))
		.pipe(browserSync.reload({ stream: true }));
}

function css() {
	// const plugins = [autoprefixer(), postcssCombineMediaQuery(), cssnano()];
	const plugins = [autoprefixer(), postcssCombineMediaQuery()];
	return (
		src('src/styles/**/*.css')
			.pipe(plumber())
			// .pipe(concatcss('style.css'))
			.pipe(postcss(plugins))
			.pipe(dest('dist/styles'))
			.pipe(browserSync.reload({ stream: true }))
	);
}

function js() {
	return (
		src('src/scripts/**/*.js')
			.pipe(plumber())
			// .pipe(concat('app.min.js'))
			.pipe(uglify())
			.pipe(dest('dist/scripts'))
			.pipe(browserSync.reload({ stream: true }))
	);
}

function images() {
	return src('src/images/**/*', { encoding: false })
		.pipe(dest('dist/images'))
		.pipe(browserSync.reload({ stream: true }));
}

// async function images() {
// 	imagecomp(
// 		'src/images/**/*.{png, jpg, gif}', // Берём все изображения из папки источника
// 		'dist/images/', // Выгружаем оптимизированные изображения в папку назначения
// 		{ compress_force: false, autoupdate: true },
// 		false, // Настраиваем основные параметры
// 		{ jpg: { engine: 'mozjpeg', command: ['-quality', '75'] } }, // Сжимаем и оптимизируем изображеня
// 		{ png: { engine: 'pngquant', command: ['--quality=75-100', '-o'] } },
// 		{ svg: { engine: 'svgo', command: '--multipass' } },
// 		{
// 			gif: {
// 				engine: 'gifsicle',
// 				command: ['--colors', '64', '--use-col=web'],
// 			},
// 		},
// 		function (err, completed) {
// 			// Обновляем страницу по завершению
// 			if (completed === true) {
// 				browserSync.reload({ stream: true });
// 			}
// 		},
// 	);

// return src('src/images/**/*.{webp, avif}', { encoding: false })
// 	.pipe(dest('dist/images'))
// 	.pipe(browserSync.reload({ stream: true }));
// }

function svg() {
	return src('src/svg/**/*.svg')
		.pipe(plumber())
		.pipe(dest('dist/svg'))
		.pipe(browserSync.reload({ stream: true }));
}

function fonts() {
	return src('src/fonts/*', { encoding: false })
		.pipe(plumber())
		.pipe(dest('dist/fonts'))
		.pipe(browserSync.reload({ stream: true }));
}

function clean() {
	return del('dist');
}

function watchFiles() {
	watch(['src/source/**/*'], source);
	watch(['src/**/*.html'], html);
	watch(['src/styles/**/*.css'], css);
	watch(['src/**/*.js'], js);
	watch(['src/fonts/**/*'], fonts);
	watch(['src/images/**/*'], images);
	watch(['src/svg/**/*.svg'], svg);
}

const build = series(
	clean,
	parallel(html, css, js, fonts, images, svg, source),
);
const watcher = parallel(build, watchFiles, serve);

exports.html = html;
exports.css = css;
exports.js = js;
exports.fonts = fonts;
exports.images = images;
exports.svg = svg;
exports.source = source;

exports.clean = clean;
exports.build = build;
exports.watcher = watcher;

exports.default = watcher;
