var gulp = require('gulp');
var uglify = require("gulp-uglify");//JavaScriptファイルの圧縮ツール
var concat = require('gulp-concat');//ファイルの結合ツール
var plumber = require("gulp-plumber");//コンパイルエラーが起きても watch を抜けないようになる
var rename = require("gulp-rename");//ファイル名の置き換えを行う
var browserify = require("gulp-browserify");//NodeJSのコードをブラウザ向けコードに変換
var packageJson = require(__dirname+'/package.json');
var _tasks = [
	'js'
];

// JavaScript を処理
gulp.task("js", function() {
	gulp.src(["src/gitParser.js"])
		.pipe(plumber())
		.pipe(browserify({}))
		.pipe(concat('gitParser.js'))
		.pipe(gulp.dest( './dist/' ))
		.pipe(concat('gitParser.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest( './dist/' ))
	;
});

// src 中のすべての拡張子を監視して処理
gulp.task("watch", function() {
	gulp.watch(["src/**/*","libs/**/*"], _tasks);
});

// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
