//general
const VERBOSE = true; //terminal debug messages
const STRIP_DEBUG = true; //if true remove console.log, alert, etc in production mode.
const PAGES_EXTENSION = '{html,php}';
const AUTO_PREFIXER_TARGET = 'last 2 version';
const TINYPNG_API_KEY = "bWvx20WuCilC1gVmmeVXwXAAHI7Wy7D5";
const HOST = 'localhost';
const PROXY = '';
const PORT = 3000;
const AUTO_CLOSE_TAB_ON_DISCONNECT = false; //for browsersync

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
const CSS_SOURCE_FILES = [{
        dir: SRC_SCSS_DIR,
        files: ['essential.scss', 'nonessential.scss'],
        sass: true,
        maps: true,
        prefixer: true,
        compress: true,
        sync: true,
        hash: false,
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
const HTML_SOURCE_FILES = [{
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
const JS_SOURCE_FILES = [{
        dir: SRC_JS_DIR,
        files: ['main.js'],
        transpile: true, //transpile es6 to es5
        compress: true,
        sync: true,
        hash: false,
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
const IMAGE_SOURCE_FILES = [{
        dir: SRC_IMG_DIR,
        files: ['**/*'],
        original: true, //move original format when webp:true
        compress: true, //needs original:true
        webp: false,
        sync: true,
        hash: false,
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
const FONT_SOURCE_FILES = [{
        dir: SRC_FONT_DIR,
        files: ['*'],
        convert: true,
        fontface: true, //auto generate @fontface css
        formats: ['woff2', 'woff', 'ttf'], //default ['eot','woff2','woff','ttf','svg']
        characters: '0123456789AaÀàÁáÂâÃãÄäBbCcÇçDdEeÈèÉéÊêËëFfGgHhIiÌìÍíÎîÏïJjKkLlMmNnÑñOoÒòÓóÔôÕõÖöPpQqRrSsTtUuÙùÚúÛûÜüVvWwXxyYÝýŸÿZz!@#$%ˆ&*()_+{}":?><`-=[];\'/.,\\|~©®ª°º±«»¿×÷“',
        sync: true,
        hash: false,
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
const ANOTHER_FILES = [{
        dir: SRC_DIR,
        files: ['.htaccess'],
        dest: BUILD_DIR,
        hash: false
    },
    /*{
        dir:'./your base folder',
        files: ['you cas move an entire folder'],
        dest: 'target folder'
    }*/
];

//values for Inject
const MUSTACHES = {
    locale: 'pt-br',
    gtmHead: '<!-- insert google tag manager here -->', //google tag manager
    gtmBody: '<!-- insert google tag manager here -->', //google tag manager
    title: 'setup-gulp-title',
    description: 'setup-gulp-description',
    author: 'André Ponce',
    keywords: 'key1,key2',
    name: 'Site Name',
    url: `http://${HOST}:${PORT}`,
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
        png16: './img/favicon-16x16.png',
        ico: './img/favicon.ico'
    },
    essentialStyles: '<link rel="stylesheet" href="./css/essential.css?v=1">',
    mainScript: '<script src="./js/main.js?v=1"></script>',
    fontFaceTemplate: `@font-face {
        font-family: '{{{fontFamily}}}';
        font-display: block;        
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

//export variables
module.exports = { VERBOSE, PAGES_EXTENSION, AUTO_PREFIXER_TARGET, TINYPNG_API_KEY, HOST, PROXY, PORT, SRC_DIR, SRC_SCSS_DIR, SRC_JS_DIR, SRC_ASSETS_DIR, SRC_FONT_DIR, SRC_IMG_DIR, BUILD_DIR, BUILD_CSS_DIR, BUILD_JS_DIR, BUILD_IMG_DIR, BUILD_FONT_DIR, BUILD_MAPS_DIR, CSS_SOURCE_FILES, HTML_SOURCE_FILES, JS_SOURCE_FILES, IMAGE_SOURCE_FILES, FONT_SOURCE_FILES, ANOTHER_FILES, MUSTACHES, AUTO_CLOSE_TAB_ON_DISCONNECT, STRIP_DEBUG }