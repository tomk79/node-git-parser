let gulp = require('gulp');
let uglify = require("gulp-uglify");//JavaScriptファイルの圧縮ツール
let concat = require('gulp-concat');//ファイルの結合ツール
let plumber = require("gulp-plumber");//コンパイルエラーが起きても watch を抜けないようになる
let rename = require("gulp-rename");//ファイル名の置き換えを行う
let browserify = require("gulp-browserify");//NodeJSのコードをブラウザ向けコードに変換
let packageJson = require(__dirname+'/package.json');

// JavaScript を処理
gulp.task("js", function() {
	return gulp.src(["src/gitParse79.js"])
		.pipe(plumber())
		.pipe(browserify({}))
		.pipe(concat('gitParse79.js'))
		.pipe(gulp.dest( './dist/' ))
		.pipe(concat('gitParse79.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest( './dist/' ))
	;
});

let _tasks = gulp.parallel(
	'js'
);

// src 中のすべての拡張子を監視して処理
gulp.task("watch", function() {
	return gulp.watch(["src/**/*","libs/**/*"], _tasks);
});

// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
