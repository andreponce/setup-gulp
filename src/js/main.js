import Module from "./module";
import $ from "jquery";

var test = "Started!";
console.log(test);
new Module();

var link = $('<link rel="stylesheet" href="./css/nonessential.css">');
link.on('load', function() {
    console.log('nonessential.css loaded');
});
var tag = $('head').append(link);