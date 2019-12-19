/**
 * EDITABLE
 * 
 * TINYPNG_API_KEY -> https://tinypng.com/
 */
const ORIGINAL_IMAGE_FORMAT = true;
const COMPRESS_IMAGES = true;
const TINYPNG_API_KEY = "bWvx20WuCilC1gVmmeVXwXAAHI7Wy7D5";
const CONVERT_IMAGES_TO_WEBP = true;
const CONVERT_FONTS = true;
const AUTO_GENERATE_FONTFACE = true;
const BUILD_FOLDER = 'build';
const BUILD_CSS_FOLDER = `css`;
const BUILD_JS_FOLDER = `js`;
const BUILD_IMG_FOLDER = `img`;
const BUILD_FONT_FOLDER = `font`;
const BUILD_MAPS_FOLDER = `maps`;
const AUTO_PREFIXER_TARGET = 'last 2 version';
const CSS_SOURCES_FILES = ['essential.scss', 'nonessential.scss'];
const JS_SOURCES_FILES = ['main.js'];
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
    fontTypes: ['eot', 'woff2', 'woff', 'ttf', 'svg'],
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
    scannedFonts: null
};
//END EDITABLE

//dependences
const { src, dest, watch, series, parallel, task } = require('gulp'),
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

const SRC_FOLDER = 'src';
const SRC_SCSS_FOLDER = `${SRC_FOLDER}/scss`;
const SRC_JS_FOLDER = `${SRC_FOLDER}/js`;
const SRC_ASSETS_FOLDER = `${SRC_FOLDER}/assets`;
const SRC_FONT_FOLDER = `${SRC_ASSETS_FOLDER}/font`;
const SRC_IMG_FOLDER = `${SRC_ASSETS_FOLDER}/img`;
const SRC_VIDEO_FOLDER = `${SRC_ASSETS_FOLDER}/video`;
const isProduction = process.env.NODE_ENV == 'production';
var updateAssetsAfterChange = false;

function runSeries(sources, done) {
    var runned = 0;
    function next() {
        var func = sources[runned];
        runned++;
        if (func) {
            var src = func();
            if (src) src.on('end', next);
            else next();
        }
        else done();
    }
    next();
}

// functions
task('css', (done) => {
    let buildCssFolder = `${BUILD_FOLDER}/${BUILD_CSS_FOLDER}/`;

    runSeries([
        function () {
            del.sync(buildCssFolder + '*');
            return null;
        },
        function () {
            if (fs.existsSync(`${SRC_SCSS_FOLDER}/font.mustache.scss`)) {
                var mustach = src([`${SRC_SCSS_FOLDER}/font.mustache.scss`])
                    .pipe(mustache(MUSTACHES))
                    .pipe(concat('font.scss'))
                    .pipe(dest(SRC_SCSS_FOLDER));
                return mustach;
            }
            return null;
        },
        function () {
            CSS_SOURCES_FILES.forEach(function (fileName, index) {
                let path = `${SRC_SCSS_FOLDER}/${fileName}`;
                if (fs.existsSync(path)) {
                    let style = src([path])
                        .pipe(plumber())
                        .pipe(!isProduction ? sourcemaps.init({ loadMaps: true }) : noop())
                        .pipe(sass.sync({
                            errLogToConsole: true,
                            //outputStyle: isProduction ? 'compressed' : 'expanded'
                        }))
                        .pipe(autoprefixer(AUTO_PREFIXER_TARGET))
                        .pipe(isProduction ? cssnano() : noop())
                        .pipe(!isProduction ? sourcemaps.write(`${BUILD_MAPS_FOLDER}`) : noop())
                        .pipe(dest(buildCssFolder))
                        .pipe(browsersync.stream());
                    return style;
                }
            });
            return null;
        }
    ], done);
});

task('html', (done) => {
    let buildHtmlFolder = `${BUILD_FOLDER}/`;

    runSeries([
        function () {
            del.sync(buildHtmlFolder + '*.{html,php}');
            return null;
        },
        function () {
            let html = src([`${SRC_FOLDER}/**/*.{html,php}`])
            html.pipe(mustache(MUSTACHES))

            //production
            if (isProduction) {
                html.pipe(removeHtmlComments())
                html.pipe(minifyInline())
                html.pipe(htmlmin({ collapseWhitespace: true }))
            }

            html.pipe(dest(buildHtmlFolder))

            return html;
        }
    ], done);
});

task('js', (done) => {
    let buildJsFolder = `./${BUILD_FOLDER}/${BUILD_JS_FOLDER}/`;

    runSeries([
        function () {
            del.sync(buildJsFolder + '*');
            return null;
        },
        function () {
            JS_SOURCES_FILES.forEach(function (fileName, index) {
                let path = `${SRC_JS_FOLDER}/${fileName}`;
                if (fs.existsSync(path)) {
                    /*let js = src([`${SRC_JS_FOLDER}/${fileName}`])
                    if (isProduction) js.pipe(sourcemaps.init())
                    if (isProduction) js.pipe(uglify())
                    if (isProduction) js.pipe(sourcemaps.write(`${BUILD_MAPS_FOLDER}`))
                    js.pipe(dest(buildJsFolder))
                    return js;*/
                    let bundle = browserify({
                        entries: [path],
                        plugin: [
                            [require('esmify'), {}]
                        ],
                        debug: !isProduction
                    })
                        .bundle()
                        .pipe(source(fileName))
                        .pipe(buffer())
                        //.pipe(!isProduction ? sourcemaps.init({ loadMaps: true }) : noop())
                        .pipe(isProduction ? uglify() : noop())
                        //.pipe(!isProduction ? sourcemaps.write(`${BUILD_MAPS_FOLDER}`) : noop())

                    return bundle.pipe(dest(buildJsFolder)).pipe(browsersync.stream());
                }
            });
            return null;
        }
    ], done);
});

task('images', (done) => {
    let srcImgFolder = `${SRC_IMG_FOLDER}/**/*`;
    let buildImgFolder = `${BUILD_FOLDER}/${BUILD_IMG_FOLDER}/`;

    var sources = [];

    if (isProduction || !fs.existsSync(buildImgFolder) || updateAssetsAfterChange) {

        if (ORIGINAL_IMAGE_FORMAT || CONVERT_IMAGES_TO_WEBP) {
            sources.push(function () {
                del.sync(buildImgFolder + '*');
                return null;
            });
        }

        if (ORIGINAL_IMAGE_FORMAT) {
            if (COMPRESS_IMAGES) {
                if (TINYPNG_API_KEY) {
                    sources.push(function () {
                        var tiny = src(srcImgFolder + '.{png,jpg,jpeg}')
                            .pipe(plumber())
                            .pipe(tinypng({
                                key: TINYPNG_API_KEY,
                                sigFile: `${SRC_IMG_FOLDER}/.tinypng-sigs`,
                                force: true,
                                log: true
                            }))
                            .pipe(dest(buildImgFolder));
                        return tiny;
                    });
                }

                sources.push(function () {
                    var imageCompress = src(srcImgFolder + (TINYPNG_API_KEY ? '.{svg,gif}' : ''))
                        .pipe(image({
                            optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
                            pngquant: ['--speed=1', '--force', 256],
                            zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
                            jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
                            mozjpeg: ['-optimize', '-progressive'],
                            guetzli: ['--quality', 85],
                            gifsicle: ['--optimize'],
                            svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors']
                        }))
                        .pipe(dest(buildImgFolder));
                    return imageCompress;
                });
            } else {
                sources.push(function () {
                    var images = src(srcImgFolder)
                        .pipe(dest(buildImgFolder));
                    return images;
                });
            }
        }

        if (CONVERT_IMAGES_TO_WEBP) {
            sources.push(function () {
                var webpImages = src(srcImgFolder + '.{png,jpg,jpeg}')
                    .pipe(webp())
                    .pipe(dest(buildImgFolder));
                return webpImages;
            });
        }
    }

    if (!isProduction) updateAssetsAfterChange = true;

    if (sources.length > 0) runSeries(sources, done);
    else done();
});

task('fonts', (done) => {
    let srcFontFolder = `${SRC_FONT_FOLDER}/**/*.ttf`;
    let buildFontFolder = `${BUILD_FOLDER}/${BUILD_FONT_FOLDER}/`;

    var sources = [];

    //fonts
    if (isProduction || !fs.existsSync(buildFontFolder) || updateAssetsAfterChange) {
        sources.push(function () {
            del.sync(buildFontFolder + '*');
            return null;
        });

        if (CONVERT_FONTS) {
            sources.push(function () {
                var fonts = src(srcFontFolder)
                    .pipe(fontmin({
                        text: '0123456789AaÀàÁáÂâÃãÄäBbCcÇçDdÈèÉéÊêËëFfGgHhÌìÍíÎîÏïJjKkLlMmNnÑñOoÒòÓóÔôÕõÖöPpQqRrSsTtÙùÚúÛûÜüVvWwXxÝýŸÿZz!@#$%ˆ&*()_+{}":?><`-=[];\'/.,\\|~©®ª°º±«»¿×÷',
                    }))
                    .pipe(dest(buildFontFolder))
                return fonts;
            });
            sources.push(function () {
                del([buildFontFolder + '*.css']);
                return updateFontSass();
            });
        } else {
            sources.push(function () {
                var fonts = src(srcFontFolder)
                    .pipe(dest(buildFontFolder))
                return fonts;
            });
            sources.push(function () {
                return updateFontSass();
            });
        }
    }
    if (sources.length > 0) runSeries(sources, done);
    else updateFontSass(done);
});

function updateFontSass(done) {
    if (!fs.existsSync(`${SRC_SCSS_FOLDER}/font.mustache.scss`) || !AUTO_GENERATE_FONTFACE) return null;

    let srcFontFolder = `${SRC_FONT_FOLDER}/**/*.{ttf,otf,woff,woff2,ttc,dfont}`;
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

    glob(srcFontFolder, {}, function (er, files) {
        var fonts = [];
        var fontFamilyFunctions = [];
        var fontFunctions = [];
        var dicFontFamilyFuncs = {};

        files.forEach(function (path, index) {
            var font = fontkit.openSync('./' + path);
            var dotIndex = path.lastIndexOf('.');
            var fileName = path.substring(path.lastIndexOf('/') + 1, dotIndex);
            //var extension = path.substring(dotIndex + 1)
            var values = font.postscriptName.split('-');
            var fullFontName = font.fullName;
            var fontFunction = fullFontName.split(' ').join('');
            var props = values[1].split(/(?=[A-Z][a-z])/);
            var fontFamily = (fullFontName.split(" ").filter((item) => !props.includes(item))).join(' ');
            var fontFamilyFunction = fontFamily.replace(/\s+/g, '')
            var fontWeight, fontStyle;

            fontFunction += fontFunction == fontFamilyFunction ? 'Regular' : '';

            //console.log('===');
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
            MUSTACHES.fontTypes.forEach(function (extension, index) {
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
                types.push({ fontPath: `../${BUILD_FONT_FOLDER}/${fileName}.${extension}${hash}`, fontFormat: format, separator: index < MUSTACHES.fontTypes.length - 1 ? ',' : ';' });
            });

            let fontData = {
                fullFontName: fullFontName,
                fontFamily: fontFamily,
                fontFamilyFunction: fontFamilyFunction,
                fontFunction: fontFunction,
                fontWeight: fontWeight,
                fontStyle: fontStyle,
                eotSrc: (MUSTACHES.fontTypes.indexOf('eot') > -1 ? `src: url('../${BUILD_FONT_FOLDER}/${fileName}.eot');` : ''),
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

        src([`${SRC_SCSS_FOLDER}/font.mustache.scss`])
            .pipe(mustache(MUSTACHES))
            .pipe(concat('font.scss'))
            .pipe(dest(SRC_SCSS_FOLDER));

        if (done) done();
    });
    return null;
}

task('browser-sync', function (done) {
    browsersync.init({
        //proxy: "localhost:8888"
        server: {
            baseDir: "./build"
        },
        watchEvents: ["add", "change", 'unlink'],
        logConnections: true,
        logLevel: "info",
        notify: true
    }, done)
});

console.log(`building for ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} MODE...`);

task('default', () => {
    let cssFiles = [`${SRC_SCSS_FOLDER}/**/*.scss`];
    if (fs.existsSync(`${SRC_SCSS_FOLDER}/font.mustache.scss`)) cssFiles.push(`!${SRC_SCSS_FOLDER}/font.scss`);

    watch(cssFiles, parallel(['css']));
    watch([`${SRC_JS_FOLDER}/**/*.js`], parallel(['js']));
    watch([`${SRC_FOLDER}/**/*.{html,php}`], parallel(['html']));
    watch([`${SRC_ASSETS_FOLDER}/**/*.ttf`], parallel(['fonts']));
    watch([`${SRC_ASSETS_FOLDER}/**/*.{png,jpg,jpeg,gif,svg}`], parallel(['images']));
    watch([`${BUILD_FOLDER}/**/*.{html,php,js}`, `!${BUILD_FOLDER}/**/*.map`]).on('change', browsersync.reload);

    series(['fonts', 'images', 'css', 'js', 'html', 'browser-sync'])()
});

task('build', series(['fonts', 'images', 'css', 'js', 'html']));