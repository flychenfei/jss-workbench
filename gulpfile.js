var hbsp = require("hbsp");
var path = require("path");
var concat = require('gulp-concat');
var gulp = require("gulp");
var del = require("del");
var fs = require("fs-extra");

var ext_replace = require('gulp-ext-replace');

var hbsPrecompile = hbsp.precompile;

var workbenchDir = "src/main/webapp/workbench";

// --------- postcss require --------- //
var postcss = require('gulp-postcss');
var cssImport = require('postcss-import'); // to allow mixin imports
var autoprefixer = require('autoprefixer');
var postcssMixins = require("postcss-mixins");
var postcssSimpleVars = require("postcss-simple-vars");
var postcssNested = require("postcss-nested");
var cssnext = require('postcss-cssnext');

var processors = [
	cssImport,
	postcssMixins,
	postcssSimpleVars,
	postcssNested,
	cssnext,
	autoprefixer({ browsers: ['last 2 versions'] })
];
// --------- /postcss require --------- //

var cssDir = path.join(workbenchDir,"/css/");

gulp.task('default',['clean','workbench-tmpl','workbench-pcss','controllers-js']);

// --------- Web Assets Processing --------- //
gulp.task('watch', ['default'], function(){

	gulp.watch(path.join(workbenchDir,"/tmpl/",'*.tmpl'), ['workbench-tmpl']);

	gulp.watch(path.join(workbenchDir,"/pcss/",'*.pcss'), ['workbench-pcss']);

	gulp.watch(path.join(workbenchDir,"/js/controller",'*.js'), ['controllers-js']);
	
});

gulp.task('clean', function(){
	var dirs = [cssDir];
	
	var dir;
	for (var i = 0; i < dirs.length ; i ++){
		dir = dirs[i];
				// make sure the directories exists (they might not in fresh clone)
		if (!fs.existsSync(dir)) {
			fs.mkdir(dir);
		}
				// delete the .css files (this makes sure we do not )
		del.sync(dir + "*.css");
	}
});

gulp.task('controllers-js', function(){
	gulp.src(path.join(workbenchDir,"/js/controller",'*.js'))
			.pipe(concat("controllers.js"))
			.pipe(gulp.dest(path.join(workbenchDir,"/js/")));
});

gulp.task('workbench-tmpl', function() {
	gulp.src(path.join(workbenchDir,"/tmpl/",'*.tmpl'))
			.pipe(hbsPrecompile())
			.pipe(concat("templates.js"))
			.pipe(gulp.dest(path.join(workbenchDir,"/js/")));
});


gulp.task('workbench-pcss', function() {
	gulp.src(path.join(workbenchDir,"/pcss/",'*.pcss'))
		.pipe(postcss(processors))
		.pipe(concat("all.css"))
		.pipe(gulp.dest(cssDir));
});

// --------- /Web Assets Processing --------- //
