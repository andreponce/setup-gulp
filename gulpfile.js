//general
const VERBOSE = true;
const PAGES_EXTENSION = '{html,php}';
const AUTO_PREFIXER_TARGET = 'last 2 version';
const TINYPNG_API_KEY = "bWvx20WuCilC1gVmmeVXwXAAHI7Wy7D5";
const PROXY = '';

//Source directories
const SRC_DIR = 'src';
const SRC_SCSS_DIR = `${SRC_DIR}/scss`;
const SRC_JS_DIR = `${SRC_DIR}/js`;
const SRC_ASSETS_DIR = `${SRC_DIR}/assets`;
const SRC_FONT_DIR = `${SRC_ASSETS_DIR}/font`;
const SRC_IMG_DIR = `${SRC_ASSETS_DIR}/img`;

//Build directories
const BUILD_DIR = 'build';
const BUILD_CSS_DIR = `css`;
const BUILD_JS_DIR = `js`;
const BUILD_IMG_DIR = `img`;
const BUILD_FONT_DIR = `font`;
const BUILD_MAPS_DIR = `maps`;

//css files
const CSS_SOURCE_FILES = [
    {
        dir: SRC_SCSS_DIR,
        files: ['essential.scss', 'nonessential.scss'],
        sass: true,
        maps: true,
        prefixer: true,
        compress: true,
        sync: true,
        dest: `${BUILD_DIR}/${BUILD_CSS_DIR}`
    },
    /*{
        dir: './node_modules/bootstrap/dist/css',
        files: ['bootstrap-grid.min.css', 'bootstrap-reboot.min.css', 'bootstrap.min.css'],
        concat: 'bootstrap.css',
        compress: true,
        dest: `${BUILD_DIR}/${BUILD_CSS_DIR}/libs`
    }*/
];

//pages files
const HTML_SOURCE_FILES = [
    {
        dir: `${SRC_DIR}/**`,
        files: [`*.${PAGES_EXTENSION}`],
        compress: true,
        sync: true,
        dest: `${BUILD_DIR}`
    },
    {
        dir: `${SRC_DIR}`,
        files: [`sitemap.xml`],
        compress: true,
        dest: `${BUILD_DIR}`
    }
];

//js files
const JS_SOURCE_FILES = [
    {
        dir: SRC_JS_DIR,
        files: ['main.js'],
        transpile: true,//transpile es6 to es5
        compress: true,
        sync: true,
        dest: `${BUILD_DIR}/${BUILD_JS_DIR}`
    },
    /*{
        dir: 'node_modules',
        files: ['bootstrap/dist/js/*.js', 'jquery/dist/jquery.min.js'],
        concat: 'libs.js',
        compress: true,
        dest: `${BUILD_DIR}/${BUILD_JS_DIR}`
    }*/
];

//images files
const IMAGE_SOURCE_FILES = [
    {
        dir: SRC_IMG_DIR,
        files: ['*'],
        original: true, //move original format when webp:true
        compress: true, //needs original:true
        webp: false,
        sync: true,
        dest: `${BUILD_DIR}/${BUILD_IMG_DIR}`
    },
    /*{
        dir: 'node_modules/bootstrap-3-typeahead',
        files: ['typeaheadv4.png'],
        original: true,
        compress: true,
        webp: true,
        dest: `${BUILD_DIR}/${BUILD_IMG_DIR}`
    }*/
];

//font files
const FONT_SOURCE_FILES = [
    {
        dir: SRC_FONT_DIR,
        files: ['*'],
        convert: true,
        fontface: true, //auto generate @fontface css
        formats: ['woff2', 'woff', 'ttf'], //default ['eot','woff2','woff','ttf','svg']
        characters: '0123456789AaÀàÁáÂâÃãÄäBbCcÇçDdÈèÉéÊêËëFfGgHhÌìÍíÎîÏïJjKkLlMmNnÑñOoÒòÓóÔôÕõÖöPpQqRrSsTtÙùÚúÛûÜüVvWwXxÝýŸÿZz!@#$%ˆ&*()_+{}":?><`-=[];\'/.,\\|~©®ª°º±«»¿×÷',
        sync: true,
        dest: `${BUILD_DIR}/${BUILD_FONT_DIR}`
    },
    /*{
        dir: '/Users/andreponce/Desktop/font',
        files: ['BrandonGrotesque-Black.ttf'],
        convert: true,
        fontface: true,
        formats: ['woff2'],
        dest: `${BUILD_DIR}/${BUILD_FONT_DIR}`
    }*/
];

//move another files
const ANOTHER_FILES = [
    {
        dir: SRC_DIR,
        files: ['.htaccess'],
        dest: BUILD_DIR
    }
];

//values for Inject
const MUSTACHES = {
    locale: 'pt-br',
    gtm: '<!-- insert google tag manager here -->',//google tag manager
    title: 'setup-gulp-title',
    description: 'setup-gulp-description',
    author: 'André Ponce',
    keywords: 'key1,key2',
    name: 'Site Name',
    url: 'http://www.andreponce.com',
    themeColor: '#ffffff',
    facebook: {
        image: './img/facebook.png',
        type: 'website',
        width: 1200,
        height: 600
    },
    twitter: {
        card: 'summary_large_image',
        image: './img/twitter.png',
    },
    android: {
        icon: './img/android-chrome-192x192.png',
    },
    ios: {
        icon: './img/apple-touch-icon.png',
        style: 'black'
    },
    win: {
        icon: './img/mstile-150x150.png',
        color: '#000000'
    },
    favicon: {
        ios180: '/img/apple-touch-icon.png',
        png32: './img/favicon-32x32.png',
        png16: './img/favicon-16x16.png'
    },
    essentialStyles: '<link rel="stylesheet" href="./css/essential.css">',
    mainScript: '<script src="./js/main.js"></script>',
    fontFaceTemplate: `@font-face {
        font-family: '{{{fontFamily}}}';
        font-display:swap;        
        {{{eotSrc}}}
        src: local('{{{fullFontName}}}'), 
            {{#types}}
                url('{{{fontPath}}}') format('{{{fontFormat}}}'){{separator}}
            {{/types}}
        font-weight: {{{fontWeight}}};
        font-style: {{{fontStyle}}};
    }`,
    fontFamilyFuncTemplate: `@mixin {{{fontFamilyFunction}}}($size,$weight,$style){font-family: '{{{fontFamily}}}',Arial,Verdana,Sans-Serif;font-weight: $weight;font-style: $style;font-size: $size;}`,
    fontFuncTemplate: `@mixin {{{fontFunction}}}($size){@include {{{fontFamilyFunction}}}($size,{{{fontWeight}}},{{{fontStyle}}});}`,
    scannedFonts: ''
};
//END

//dependences
const { src, dest, watch, series, parallel, task } = require('gulp'),
    through = require('through2'),
    chalk = require('chalk'),
    log = require('fancy-log'),
    noop = require("gulp-noop"),
    del = require('del'),
    glob = require("glob"),
    mustache = require('gulp-mustache'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass'),
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
    browserify = require("browserify"),
    //babelify = require("babelify"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer");

const isProduction = process.env.NODE_ENV == 'production';
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
        }
        else done();
    }
    next();
}

function logProcess(obj) {
    if (VERBOSE) log(chalk`Processing '{magenta ${obj.dir}}' + '{magenta ${obj.files}}'` + (obj.concat ? chalk` to '{magenta ${obj.concat}}'` : '') + chalk` => '{magenta ${obj.dest}}'`);
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

    obj.ignore = !_sync;

    logProcess(obj);

    let _compressBool = (_compress && isProduction);

    let source = src(_files, { cwd: _dir, allowEmpty: true });
    source.pipe(plumber())
        .pipe((_maps && !isProduction) ? sourcemaps.init({ loadMaps: true }) : noop())
        .pipe(_concat ? concat(_concat) : noop())
        .pipe(_sass ? sass.sync({
            errLogToConsole: true,
            //outputStyle: isProduction ? 'compressed' : 'expanded'
        }) : noop())
        .pipe(_prefixer ? autoprefixer(AUTO_PREFIXER_TARGET) : noop())
        .pipe(_compressBool ? cssnano({ discardComments: { removeAll: true } }) : noop())
        .pipe((_maps && !isProduction) ? sourcemaps.write(`${BUILD_MAPS_DIR}`) : noop())
        .pipe(dest(_dest))
        .pipe(_sync ? browsersync.stream() : noop());
    return source;
}

function processStyles(done) {
    let sources = [];

    sources.push({
        func: function () {
            if (fs.existsSync(`${SRC_SCSS_DIR}/font.mustache.scss`)) {
                var mustach = src([`${SRC_SCSS_DIR}/font.mustache.scss`])
                    .pipe(mustache(MUSTACHES))
                    .pipe(concat('font.scss'))
                    .pipe(dest(SRC_SCSS_DIR));
                return mustach;
            }
            return null;
        }
    });
    CSS_SOURCE_FILES.forEach(function (obj, index) {
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

    obj.ignore = !_sync;

    logProcess(obj);

    if (_transpile) {
        let bundle = browserify({
            basedir: _dir,
            entries: _files,
            plugin: [
                [require('esmify'), {}]
            ],
            debug: !isProduction
        })
            .bundle();
        bundle.pipe(source(_concat ? _concat : 'main.js'))
            .pipe(buffer())
            .pipe(isProduction ? uglify() : noop())
            .pipe(dest(_dest)).pipe(browsersync.stream());
        return bundle
    } else {
        let source = src(_files, { cwd: _dir, allowEmpty: true });
        source.pipe(plumber())
            .pipe(_concat ? concat(_concat) : noop())
            .pipe((isProduction && _compress) ? uglify() : noop())
            .pipe(dest(_dest))
            .pipe(_sync ? browsersync.stream() : noop());
        return source;
    }
}

function processScripts(done) {
    let sources = [];
    JS_SOURCE_FILES.forEach(function (obj, index) {
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
    source.pipe(mustache(MUSTACHES))
        .pipe(production ? removeHtmlComments() : noop())
        .pipe(production ? minifyInline() : noop())
        .pipe(production ? htmlmin({ collapseWhitespace: true }) : noop())
        .pipe(dest(_dest))
        .pipe(_sync ? browsersync.stream() : noop());
    return source;
}

function processPages(done) {
    let sources = [];
    HTML_SOURCE_FILES.forEach(function (obj, index) {
        if (!obj.ignore) sources.push({ func: processPage, params: obj });
    });
    runSeries(sources, done);
}

function tinyImages(obj) {
    var tiny = src(obj.files.concat('!**/*.{svg,gif}'), { cwd: obj.dir, allowEmpty: true })
        .pipe(plumber())
        .pipe(tinypng({
            key: TINYPNG_API_KEY,
            sigFile: `${obj.dir}/.tinypng-sigs`,
            force: true,
            log: VERBOSE
        }))
        .pipe(dest(obj.dest));
    return tiny;
}

function offlineImagesCompress(obj) {
    var imageCompress = src(TINYPNG_API_KEY ? obj.files.concat('!**/*.{png,jpg,jpeg}') : obj.files, { cwd: obj.dir, allowEmpty: true })
        .pipe(image({
            optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
            pngquant: ['--speed=1', '--force', 256],
            zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
            jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
            mozjpeg: ['-optimize', '-progressive'],
            guetzli: ['--quality', 85],
            gifsicle: ['--optimize'],
            svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors'],
            quiet: !VERBOSE
        }))
        .pipe(dest(obj.dest));
    return imageCompress;
}

function moveImages(obj) {
    var images = src(obj.files, { cwd: obj.dir, allowEmpty: true })
        .pipe(dest(obj.dest));
    return images;
}

function imagesToWebp(obj) {
    var webpImages = src(obj.files.concat('!**/*.{svg,gif}'), { cwd: obj.dir, allowEmpty: true })
        .pipe(webp())
        .pipe(dest(obj.dest));
    return webpImages;
}

function processImages(done) {
    let sources = [];
    IMAGE_SOURCE_FILES.forEach(function (obj, index) {
        if (!obj.ignore) {
            let _files = obj.files;
            let _compress = obj.compress;
            let _webp = obj.webp;
            let _original = obj.original;
            let _sync = obj.sync;
            let _dest = obj.dest;

            obj.ignore = !_sync;

            logProcess(obj);

            if (isProduction || !fs.existsSync(_dest) || updateAssetsAfterChange) {
                if (_original) {
                    if (_compress && isProduction) {
                        if (TINYPNG_API_KEY) {
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
            }
        }
    });

    if (!isProduction) updateAssetsAfterChange = true;

    if (sources.length > 0) runSeries(sources, function(){
        browsersync.reload();
        done();
    });
    else done();
}

function processFont(obj) {
    var fonts = src(obj.files, { cwd: obj.dir, allowEmpty: true })
        .pipe(fontmin({
            text: obj.characters,
            verbose: VERBOSE
        }))
        .pipe(dest(obj.dest))
    fonts.pipe(through.obj(function (file, enc, cb) {
        let path = file.path;
        let ext = path.split('.').pop();
        if (obj.formats.indexOf(ext) < 0) del.sync(path);
        cb(null);
    }))
    return fonts;
}

function moveFonts(obj) {
    var fonts = src(obj.files, { cwd: obj.dir, allowEmpty: true })
        .pipe(dest(obj.dest))
    return fonts;
}

function processFonts(done) {
    let sources = [];
    FONT_SOURCE_FILES.forEach(function (obj, index) {
        if (!obj.ignore) {
            let _convert = obj.convert;
            let _sync = obj.sync;
            let _dest = obj.dest;

            obj.ignore = !_sync;

            logProcess(obj);

            if (isProduction || !fs.existsSync(_dest) || updateAssetsAfterChange) {
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
            }
        }
    });
    if (sources.length > 0) runSeries(sources, function () {
        updateFontSass(done);
    });
    else updateFontSass(done);
}

function updateFontSass(done) {
    if (!fs.existsSync(`${SRC_SCSS_DIR}/font.mustache.scss`)) return null;

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

    FONT_SOURCE_FILES.forEach(function (obj, index) {
        let dir = obj.dir;
        let files = obj.files;
        let fontface = obj.fontface;
        let formats = obj.formats;

        if (!fontface) return;

        formats = formats ? formats : ['eot', 'woff2', 'woff', 'ttf', 'svg'];

        let fontFiles = [];
        files.forEach(function (path, index) {
            fontFiles = fontFiles.concat(glob.sync(`${dir}/${path}`));
        });

        fontFiles.forEach(function (path, index) {
            var font = fontkit.openSync(path);
            var dotIndex = path.lastIndexOf('.');
            var fileName = path.substring(path.lastIndexOf('/') + 1, dotIndex);
            //var extension = path.substring(dotIndex + 1)
            var values = font.postscriptName.split('-');
            var fullFontName = font.fullName.split('-').join(' ');
            var fontFunction = fullFontName.split(' ').join('');
            var props = values[1].split(/(?=[A-Z][a-z])/);
            var fontFamily = (fullFontName.split(" ").filter((item) => !props.includes(item))).join(' ');
            var fontFamilyFunction = fontFamily.replace(/\s+/g, '')
            var fontWeight, fontStyle;

            fontFunction += fontFunction == fontFamilyFunction ? 'Regular' : '';

            //console.log('===');
            //console.log(font.postscriptName);
            //console.log(font.fullName);
            //console.log('fullFontName:', fullFontName);
            props.forEach(function (prop, index) {
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
            formats.forEach(function (extension, index) {
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
                types.push({ fontPath: `../${BUILD_FONT_DIR}/${fileName}.${extension}${hash}`, fontFormat: format, separator: index < formats.length - 1 ? ',' : ';' });
            });

            let fontData = {
                fullFontName: fullFontName,
                fontFamily: fontFamily,
                fontFamilyFunction: fontFamilyFunction,
                fontFunction: fontFunction,
                fontWeight: fontWeight,
                fontStyle: fontStyle,
                eotSrc: (formats.indexOf('eot') > -1 ? `src: url('../${BUILD_FONT_DIR}/${fileName}.eot');` : ''),
                types: types
            }

            var fontFace = mustache.mustache.render(MUSTACHES.fontFaceTemplate, fontData);

            fonts.push({ fontFace: fontFace });
            fontFunctions.push({ func: mustache.mustache.render(MUSTACHES.fontFuncTemplate, fontData) });
            if (!dicFontFamilyFuncs[fontFamilyFunction]) {
                dicFontFamilyFuncs[fontFamilyFunction] = true;
                fontFamilyFunctions.push({ func: mustache.mustache.render(MUSTACHES.fontFamilyFuncTemplate, fontData) });
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

    MUSTACHES.scannedFonts = scannedFonts;

    src([`${SRC_SCSS_DIR}/font.mustache.scss`])
        .pipe(mustache(MUSTACHES))
        .pipe(concat('font.scss'))
        .pipe(dest(SRC_SCSS_DIR));

    if (VERBOSE) log(chalk`Generated {green @Fontface} '{magenta ${SRC_SCSS_DIR}/font.scss}'`);

    if (done) done();

    return null;
}

function processFiles(obj) {
    obj.ignore = !obj.sync;

    logProcess(obj);

    let source = src(obj.files, { cwd: obj.dir, allowEmpty: true });
    source.pipe(dest(obj.dest))
    return source;
}

function processAnotherFiles(done) {
    let sources = [];
    ANOTHER_FILES.forEach(function (obj, index) {
        if (!obj.ignore) sources.push({ func: processFiles, params: obj });
    });
    runSeries(sources, done);
}

function processBrowserSync(done) {
    let config = {
        watchEvents: ["add", "change", 'unlink'],
        logConnections: true,
        logLevel: VERBOSE ? "info" : "silent",
        notify: true
    };
    if (PROXY && PROXY != '') config.proxy = PROXY;
    else {
        config.server = {
            baseDir: BUILD_DIR
        };
    }
    browsersync.init(config, done)
}

function clear(done) {
    let paths;
    if (isProduction) {
        paths = [`${BUILD_DIR}`];
    } else {
        paths = [
            `${BUILD_DIR}/*`,
            `!${BUILD_DIR}/${BUILD_CSS_DIR}`,
            `!${BUILD_DIR}/${BUILD_JS_DIR}`,
            `!${BUILD_DIR}/${BUILD_FONT_DIR}`,
            `!${BUILD_DIR}/${BUILD_IMG_DIR}`,
            `${BUILD_DIR}/${BUILD_CSS_DIR}/*`,
            `${BUILD_DIR}/${BUILD_JS_DIR}/*`,
            `${BUILD_DIR}/*.${PAGES_EXTENSION}`,
        ];
    }
    del.sync(paths);
    done();
}

log(chalk`{${isProduction ? 'red.bold' : 'blue.bold'} runnin in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} MODE...}`);
if (!isProduction) {
    log(chalk`{yellow.bold For rebuild images/fonts folders delete them in the build folder and run build command again.}`);
    log(chalk`{yellow.bold Images/css/js compression will only work in Production Mode.}`);
    log(chalk`{yellow.bold After deleting files in the src folder run the build command again to clear up the built files.}`);
}

task('dev', (done) => {
    let cssFiles = [`${SRC_SCSS_DIR}/**/*.{scss,sass}`];
    if (fs.existsSync(`${SRC_SCSS_DIR}/font.mustache.scss`)) cssFiles.push(`!${SRC_SCSS_DIR}/font.scss`);

    watch(cssFiles, parallel(processStyles));
    watch([`${SRC_JS_DIR}/**/*.js`], parallel(processScripts));
    watch([`${SRC_DIR}/**/*.${PAGES_EXTENSION}`], parallel(processPages));
    watch([`${SRC_ASSETS_DIR}/**/*.{ttf,otf,woff,woff2,ttc,dfont}`], parallel(processFonts));
    watch([`${SRC_ASSETS_DIR}/**/*.{png,jpg,jpeg,gif,svg}`], parallel(processImages));

    series(clear,
        processFonts,
        processImages,
        processStyles,
        processScripts,
        processPages,
        processAnotherFiles,
        processBrowserSync)();
});

task('build', series([
    clear, processFonts,
    processImages,
    processStyles,
    processScripts,
    processPages,
    processAnotherFiles]));