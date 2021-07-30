//dependences
var CONF = require('./config.js');
const reload = require('require-reload')(require),
    { src, dest, watch, series, parallel, task } = require('gulp'),
    through = require('through2'),
    chalk = require('chalk'),
    log = require('fancy-log'),
    noop = require("gulp-noop"),
    del = require('del'),
    glob = require("glob"),
    mustache = require('gulp-mustache'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    uglify_default = require('gulp-uglify-es').default,
    stripDebug = require('gulp-strip-debug'),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass')(require('sass')),
    cssnano = require('gulp-cssnano'),
    sourcemaps = require('gulp-sourcemaps'),
    minifyInline = require('gulp-minify-inline'),
    removeHtmlComments = require('gulp-remove-html-comments'),
    autoprefixer = require('gulp-autoprefixer'),
    image = require('gulp-image'),
    webp = require('gulp-webp'),
    plumber = require('gulp-plumber'),
    tinypng = require('gulp-tinypng-extended'),
    fontmin = require('gulp-fez-fontmin'),
    fontkit = require('fontkit'),
    fs = require('fs'),
    browsersync = require("browser-sync").create(),
    autoClose = require('browser-sync-close-hook'),
    browserify = require("browserify"),
    babelify = require("babelify"),
    // classProperties = require("@babel/plugin-proposal-class-properties"),
    vinyl = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    openBrowser = require("react-dev-utils/openBrowser"),
    hash = require('gulp-hash-filename')

const isProduction = process.env.NODE_ENV == 'production';
const fileNameFormat = {
    "format": "{name}.{hash:10}{ext}"
}
var updateAssetsAfterChange = false;

// functions
function runSeries(sources, done) {
    var runned = 0;

    function next() {
        var obj = sources[runned];
        runned++;
        if (obj) {
            var func = obj.func;
            var params = obj.params;
            var src = func(params);
            if (src) src.on('end', next);
            else next();
        } else done();
    }
    next();
}

function logProcess(obj) {
    if (CONF.VERBOSE) log(chalk `Processing '{magenta ${obj.dir}}' + '{magenta ${obj.files}}'` + (obj.concat ? chalk ` to '{magenta ${obj.concat}}'` : '') + chalk ` => '{magenta ${obj.dest}}'`);
}

function processStyle(obj) {
    let _dir = obj.dir;
    let _files = obj.files;
    let _concat = obj.concat;
    let _sass = obj.sass;
    let _maps = obj.maps;
    let _prefixer = obj.prefixer;
    let _compress = obj.compress;
    let _sync = obj.sync;
    let _dest = obj.dest;
    let _hash = obj.hash;

    obj.ignore = !_sync;

    logProcess(obj);

    let _compressBool = (_compress && isProduction);

    let source = src(_files, { cwd: _dir, allowEmpty: true });
    source.pipe(plumber())
        .pipe(_hash ? hash(fileNameFormat) : noop())
        .pipe((_maps && !isProduction) ? sourcemaps.init({ loadMaps: true }) : noop())
        .pipe(_concat ? concat(_concat) : noop())
        .pipe(_sass ? sass.sync({
            errLogToConsole: true,
            //outputStyle: isProduction ? 'compressed' : 'expanded'
        }) : noop())
        .pipe(_prefixer ? autoprefixer(CONF.AUTO_PREFIXER_TARGET) : noop())
        .pipe(_compressBool ? cssnano({ discardComments: { removeAll: true }, zindex: false }) : noop())
        .pipe((_maps && !isProduction) ? sourcemaps.write(`${CONF.BUILD_MAPS_DIR}`) : noop())
        .pipe(dest(_dest))
        .pipe(_sync ? browsersync.stream() : noop())
    return source;
}

function processStyles(done) {
    let sources = [];

    sources.push({
        func: function() {
            if (fs.existsSync(`${CONF.SRC_SCSS_DIR}/font.mustache.scss`)) {
                var mustach = src([`${CONF.SRC_SCSS_DIR}/font.mustache.scss`])
                    .pipe(mustache(CONF.MUSTACHES))
                    .pipe(concat('font.scss'))
                    .pipe(dest(CONF.SRC_SCSS_DIR));
                return mustach;
            }
            return null;
        }
    });
    CONF.CSS_SOURCE_FILES.forEach(function(obj, index) {
        if (!obj.ignore) sources.push({ func: processStyle, params: obj });
    });
    runSeries(sources, done);
}

function processScript(obj) {
    let _dir = obj.dir;
    let _files = obj.files;
    let _concat = obj.concat;
    let _transpile = obj.transpile;
    let _compress = obj.compress;
    let _sync = obj.sync;
    let _dest = obj.dest;
    let _hash = obj.hash;

    obj.ignore = !_sync;

    logProcess(obj);

    if (_transpile) {
        const plugins = isProduction ? [
            ['esmify'],
            ['tinyify']
        ] : [];
        let bundle = browserify({
                basedir: _dir,
                entries: _files,
                debug: !isProduction,
                plugin: plugins
            })
            .transform(babelify.configure({ presets: ["@babel/preset-env"], compact: isProduction }))
            .bundle();
        bundle.pipe(vinyl(_concat ? _concat : 'main.js'))
            .pipe(buffer())
            .pipe(_hash ? hash(fileNameFormat) : noop())
            .pipe((isProduction && CONF.STRIP_DEBUG) ? stripDebug() : noop())
            .pipe((isProduction && _compress) ? uglify_default() : noop())
            .pipe(dest(_dest))
            .pipe(_sync ? browsersync.stream() : noop());
        return bundle
    } else {
        let source = src(_files, { cwd: _dir, allowEmpty: true });
        source.pipe(plumber())
            .pipe(_hash ? hash(fileNameFormat) : noop())
            .pipe(_concat ? concat(_concat) : noop())
            .pipe((isProduction && CONF.STRIP_DEBUG) ? stripDebug() : noop())
            .pipe((isProduction && _compress) ? uglify_default() : noop())
            .pipe(dest(_dest))
            .pipe(_sync ? browsersync.stream() : noop());
        return source;
    }
}

function processScripts(done) {
    let sources = [];
    CONF.JS_SOURCE_FILES.forEach(function(obj, index) {
        if (!obj.ignore) sources.push({ func: processScript, params: obj });
    });
    runSeries(sources, done);
}

function processPage(obj) {
    let _dir = obj.dir;
    let _files = obj.files;
    let _compress = obj.compress;
    let _sync = obj.sync;
    let _dest = obj.dest;

    obj.ignore = !_sync;

    logProcess(obj);

    let production = (isProduction && _compress);
    let source = src(_files, { cwd: _dir, allowEmpty: true })
    source.pipe(mustache(CONF.MUSTACHES))
        .pipe(production ? removeHtmlComments() : noop())
        .pipe(production ? minifyInline() : noop())
        .pipe(production ? htmlmin({ collapseWhitespace: true }) : noop())
        .pipe(dest(_dest))
        .pipe(_sync ? browsersync.stream() : noop());
    return source;
}

function processPages(done) {
    let sources = [];
    CONF.HTML_SOURCE_FILES.forEach(function(obj, index) {
        if (!obj.ignore) sources.push({ func: processPage, params: obj });
    });
    runSeries(sources, done);
}

function tinyImages(obj) {
    var tiny = src(obj.files.concat('!**/*.{svg,gif}'), { cwd: obj.dir, allowEmpty: true })
        .pipe(plumber())
        .pipe(obj.hash ? hash(fileNameFormat) : noop())
        .pipe(tinypng({
            key: CONF.TINYPNG_API_KEY,
            sigFile: `${obj.dir}/.tinypng-sigs`,
            force: true,
            log: CONF.VERBOSE
        }))
        .pipe(dest(obj.dest));
    return tiny;
}

function offlineImagesCompress(obj) {
    var imageCompress = src(CONF.TINYPNG_API_KEY ? obj.files.concat('!**/*.{png,jpg,jpeg}') : obj.files, { cwd: obj.dir, allowEmpty: true })
        .pipe(image({
            optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
            pngquant: ['--speed=1', '--force', 256],
            zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
            jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
            mozjpeg: ['-optimize', '-progressive'],
            guetzli: ['--quality', 85],
            gifsicle: ['--optimize'],
            svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors'],
            quiet: !CONF.VERBOSE
        }))
        .pipe(obj.hash ? hash(fileNameFormat) : noop())
        .pipe(dest(obj.dest));
    return imageCompress;
}

function moveImages(obj) {
    var images = src(obj.files, { cwd: obj.dir, allowEmpty: true })
        .pipe(obj.hash ? hash(fileNameFormat) : noop())
        .pipe(dest(obj.dest));
    return images;
}

function imagesToWebp(obj) {
    var webpImages = src(obj.files.concat('!**/*.{svg,gif}'), { cwd: obj.dir, allowEmpty: true })
        .pipe(webp({
            quality: 85,
            method: 5
        }))
        .pipe(obj.hash ? hash(fileNameFormat) : noop())
        .pipe(dest(obj.dest));
    return webpImages;
}

function processImages(done) {
    let sources = [];
    CONF.IMAGE_SOURCE_FILES.forEach(function(obj, index) {
        if (!obj.ignore) {
            let _files = obj.files;
            let _compress = obj.compress;
            let _webp = obj.webp;
            let _original = obj.original;
            let _sync = obj.sync;
            let _dest = obj.dest;

            obj.ignore = !_sync;

            logProcess(obj);

            if ( /*isProduction ||*/ !fs.existsSync(_dest) || updateAssetsAfterChange) {
                if (_original) {
                    if (_compress && isProduction) {
                        if (CONF.TINYPNG_API_KEY) {
                            sources.push({ func: tinyImages, params: obj });
                        }
                        sources.push({ func: offlineImagesCompress, params: obj });
                    } else {
                        sources.push({ func: moveImages, params: obj });
                    }
                }

                if (_webp) {
                    sources.push({ func: imagesToWebp, params: obj });
                }
            } else log(chalk `{yellow.bold Skipping images build.\n For rebuild images delete folder in the build folder and run build command again.}`);
        }
    });

    if (!isProduction) updateAssetsAfterChange = true;

    if (sources.length > 0) runSeries(sources, function() {
        browsersync.reload();
        done();
    });
    else done();
}

function processFont(obj) {
    var fonts = src(obj.files, { cwd: obj.dir, allowEmpty: true })
        .pipe(fontmin({
            text: obj.characters,
            verbose: CONF.VERBOSE
        }))
        .pipe(obj.hash ? hash(fileNameFormat) : noop())
        .pipe(dest(obj.dest))
    fonts.pipe(through.obj(function(file, enc, cb) {
        let path = file.path;
        let ext = path.split('.').pop();
        if (obj.formats.indexOf(ext) < 0) del.sync(path);
        cb(null);
    }))
    return fonts;
}

function moveFonts(obj) {
    var fonts = src(obj.files, { cwd: obj.dir, allowEmpty: true })
        .pipe(obj.hash ? hash(fileNameFormat) : noop())
        .pipe(dest(obj.dest))
    return fonts;
}

function processFonts(done) {
    let sources = [];
    CONF.FONT_SOURCE_FILES.forEach(function(obj, index) {
        if (!obj.ignore) {
            let _convert = obj.convert;
            let _sync = obj.sync;
            let _dest = obj.dest;

            obj.ignore = !_sync;

            logProcess(obj);

            if ( /*isProduction ||*/ !fs.existsSync(_dest) || updateAssetsAfterChange) {
                if (_convert) {
                    sources.push({
                        func: processFont,
                        params: obj
                    });
                } else {
                    sources.push({
                        func: moveFonts,
                        params: obj
                    });
                }
            } else log(chalk `{yellow.bold Skipping fonts build.\n For rebuild fonts delete folder in the build folder and run build command again.}`);
        }
    });
    if (sources.length > 0) runSeries(sources, function() {
        updateFontSass(done);
    });
    else updateFontSass(done);
}

function updateFontSass(done) {
    if (!fs.existsSync(`${CONF.SRC_SCSS_DIR}/font.mustache.scss`)) return null;

    let fontStyles = ['normal', 'italic', 'oblique'];
    let fontWeights = {
        thin: 100,
        extralight: 200,
        ultralight: 200,
        light: 300,
        book: 400,
        normal: 400,
        regular: 400,
        roman: 400,
        medium: 500,
        semibold: 600,
        demibold: 600,
        bold: 700,
        extrabold: 800,
        ultrabold: 800,
        black: 900,
        heavy: 900
    }
    var fonts = [];
    var fontFamilyFunctions = [];
    var fontFunctions = [];
    var dicFontFamilyFuncs = {};

    CONF.FONT_SOURCE_FILES.forEach(function(obj, index) {
        let dir = obj.dir;
        let files = obj.files;
        let fontface = obj.fontface;
        let formats = obj.formats;

        if (!fontface) return;

        formats = formats ? formats : ['eot', 'woff2', 'woff', 'ttf', 'svg'];

        let fontFiles = [];
        files.forEach(function(path, index) {
            fontFiles = fontFiles.concat(glob.sync(`${dir}/${path}`));
        });

        fontFiles.forEach(function(path, index) {
            var font = fontkit.openSync(path);
            var dotIndex = path.lastIndexOf('.');
            var fileName = path.substring(path.lastIndexOf('/') + 1, dotIndex);
            //var extension = path.substring(dotIndex + 1)
            var values = font.postscriptName.split('-');
            var fullFontName = font.fullName.split('-').join(' ');
            var fontFunction = fullFontName.split(' ').join('');
            var props = values[1] ? values[1].split(/(?=[A-Z][a-z])/) : font.fullName.split(" ").filter((item) => ['Bold', 'Italic', ].includes(item));
            var fontFamily = (fullFontName.split(" ").filter((item) => !props.includes(item))).join(' ');
            var fontFamilyFunction = fontFamily.replace(/\s+/g, '')
            var fontWeight, fontStyle;

            fontFunction += fontFunction == fontFamilyFunction ? 'Regular' : '';

            //console.log('===');
            //console.log(font.postscriptName);
            //console.log(font.fullName);
            //console.log('fullFontName:', fullFontName);
            props.forEach(function(prop, index) {
                prop = prop.toLowerCase();
                fontStyle = fontStyle ? fontStyle : fontStyles[fontStyles.indexOf(prop)];
                fontWeight = fontWeight ? fontWeight : fontWeights[prop];
            });

            fontWeight = fontWeight ? fontWeight : 400;
            fontStyle = fontStyle ? fontStyle : 'normal';

            /*console.log('===');
            console.log('fullFontName:', fullFontName);
            console.log('fontFunction:', fontFunction);
            console.log('fontFamily:', fontFamily);
            console.log('fontWeight:', fontWeight);
            console.log('fontStyle:', fontStyle);*/

            let types = [];
            formats.forEach(function(extension, index) {
                var format;
                var hash = '';
                switch (extension) {
                    case 'eot':
                        hash = '?#iefix';
                        format = 'embedded-opentype';
                        break;
                    case 'ttf':
                        format = 'truetype';
                        break;
                    case 'svg':
                        hash = `#${font.postscriptName}`;
                        format = extension;
                        break;
                    default:
                        format = extension;
                        break;
                }
                types.push({ fontPath: `../${CONF.BUILD_FONT_DIR}/${fileName}.${extension}${hash}`, fontFormat: format, separator: index < formats.length - 1 ? ',' : ';' });
            });

            let fontData = {
                fullFontName: fullFontName,
                fontFamily: fontFamily,
                fontFamilyFunction: fontFamilyFunction,
                fontFunction: fontFunction,
                fontWeight: fontWeight,
                fontStyle: fontStyle,
                eotSrc: (formats.indexOf('eot') > -1 ? `src: url('../${CONF.BUILD_FONT_DIR}/${fileName}.eot');` : ''),
                types: types
            }

            var fontFace = mustache.mustache.render(CONF.MUSTACHES.fontFaceTemplate, fontData);

            fonts.push({ fontFace: fontFace });
            fontFunctions.push({ func: mustache.mustache.render(CONF.MUSTACHES.fontFuncTemplate, fontData) });
            if (!dicFontFamilyFuncs[fontFamilyFunction]) {
                dicFontFamilyFuncs[fontFamilyFunction] = true;
                fontFamilyFunctions.push({ func: mustache.mustache.render(CONF.MUSTACHES.fontFamilyFuncTemplate, fontData) });
            }
        });
    });

    var eachFonts = `{{#fontFamilyFunctions}}
    {{{func}}}
    {{/fontFamilyFunctions}}
    
    {{#fontFunctions}}
    {{{func}}}
    {{/fontFunctions}}

    {{#fonts}}
    {{{fontFace}}}
    {{/fonts}}`;

    var scannedFonts = mustache.mustache.render(eachFonts, { fonts: fonts, fontFunctions: fontFunctions, fontFamilyFunctions: fontFamilyFunctions })

    CONF.MUSTACHES.scannedFonts = scannedFonts;

    src([`${CONF.SRC_SCSS_DIR}/font.mustache.scss`])
        .pipe(mustache(CONF.MUSTACHES))
        .pipe(concat('font.scss'))
        .pipe(dest(CONF.SRC_SCSS_DIR));

    if (CONF.VERBOSE) log(chalk `Generated {green @Fontface} '{magenta ${CONF.SRC_SCSS_DIR}/font.scss}'`);

    if (done) done();

    return null;
}

function processFiles(obj) {
    let _sync = obj.sync;

    obj.ignore = !_sync;

    logProcess(obj);

    let source = src(obj.files, { cwd: obj.dir, allowEmpty: true });
    source.pipe(plumber())
        .pipe(obj.hash ? hash(fileNameFormat) : noop())
        .pipe(dest(obj.dest))
        .pipe(_sync ? browsersync.stream() : noop());
    return source;
}

function processAnotherFiles(done) {
    let sources = [];
    CONF.ANOTHER_FILES.forEach(function(obj, index) {
        if (!obj.ignore) sources.push({ func: processFiles, params: obj });
    });
    runSeries(sources, done);
}

function processBrowserSync(done) {
    let config = {
        watchEvents: ["add", "change", 'unlink'],
        logConnections: true,
        logLevel: CONF.VERBOSE ? "info" : "silent",
        notify: true,
        port: CONF.PORT,
        open: false

    };
    if (CONF.PROXY && CONF.PROXY != '') config.proxy = CONF.PROXY;
    else {
        config.server = {
            baseDir: CONF.BUILD_DIR
        };
    }
    browsersync.use({
        plugin() {},
        hooks: {
            'client:js': CONF.AUTO_CLOSE_TAB_ON_DISCONNECT ? autoClose : '',
        },
    });
    browsersync.init(config, () => {
        openBrowser(CONF.PROXY ? CONF.PROXY.replace(CONF.HOST, `${CONF.HOST}:${CONF.PORT}`) : `http://${CONF.HOST}:${CONF.PORT}`);
        done();
    })
}

function clear(done) {
    let paths;
    /*if (isProduction) {
        paths = [`${CONF.BUILD_DIR}`];
    } else {*/
    paths = [
        `${CONF.BUILD_DIR}/*`,
        `!${CONF.BUILD_DIR}/${CONF.BUILD_CSS_DIR}`,
        `!${CONF.BUILD_DIR}/${CONF.BUILD_JS_DIR}`,
        `!${CONF.BUILD_DIR}/${CONF.BUILD_FONT_DIR}`,
        `!${CONF.BUILD_DIR}/${CONF.BUILD_IMG_DIR}`,
        `${CONF.BUILD_DIR}/${CONF.BUILD_CSS_DIR}/*`,
        `${CONF.BUILD_DIR}/${CONF.BUILD_JS_DIR}/*`,
        `${CONF.BUILD_DIR}/*.${CONF.PAGES_EXTENSION}`,
    ];
    //}
    del.sync(paths);
    done();
}

function configUpdated(done) {
    CONF = reload('./config.js');
    updateAssetsAfterChange = false;
    series(clear,
        processFonts,
        processImages,
        processStyles,
        processScripts,
        processPages,
        processAnotherFiles)(done);
}

log(chalk `{${isProduction ? 'red.bold' : 'blue.bold'} runnin in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} MODE...}`);
if (!isProduction) {
    log(chalk `{yellow.bold For rebuild images/fonts folders delete them in the build folder and run build command again.}`);
    log(chalk `{yellow.bold Images/css/js compression will only work in Production Mode.}`);
    log(chalk `{yellow.bold After deleting files in the src folder run the build command again to clear up the built files.}`);
}

task('dev', (done) => {
    let cssFiles = [`${CONF.SRC_SCSS_DIR}/**/*.{scss,sass}`];
    if (fs.existsSync(`${CONF.SRC_SCSS_DIR}/font.mustache.scss`)) cssFiles.push(`!${CONF.SRC_SCSS_DIR}/font.scss`);

    watch(cssFiles, parallel(processStyles));
    watch([`${CONF.SRC_JS_DIR}/**/*.js`], parallel(processScripts));
    watch([`${CONF.SRC_DIR}/**/*.${CONF.PAGES_EXTENSION}`], parallel(processPages));
    watch([`${CONF.SRC_ASSETS_DIR}/**/*.{ttf,otf,woff,woff2,ttc,dfont}`], parallel(processFonts));
    watch([`${CONF.SRC_ASSETS_DIR}/**/*.{png,jpg,jpeg,gif,svg,ico}`], parallel(processImages));
    watch([`${CONF.SRC_DIR}/**/*.{json,xml,htaccess}`], parallel(processAnotherFiles));
    // watch([`./config.js`], parallel(configUpdated));

    series(clear,
        processFonts,
        processImages,
        processStyles,
        processScripts,
        processPages,
        processAnotherFiles,
        processBrowserSync)(done);
});

task('build', series([
    clear,
    processFonts,
    processImages,
    processStyles,
    processScripts,
    processPages,
    processAnotherFiles
]));