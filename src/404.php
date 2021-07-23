<?php
header("HTTP/1.1 404 Not Found");
?>
<!DOCTYPE html>
<html lang="{{{locale}}}">

<head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# website: http://ogp.me/ns/website#">
    {{{gtmHead}}}
    <base href="{{{url}}}">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>{{{title}}}</title>
    <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1">
    <meta name="title" content="{{{title}}}">
    <meta name="author" content="{{{author}}}">
    <meta name="description" content="{{{description}}}">
    <meta name="keywords" content="{{{keywords}}}">
    <meta name="theme-color" content="{{{themeColor}}}">

    <meta itemprop="name" content="{{{name}}}">
    <meta itemprop="description" content="{{{description}}}">
    <meta itemprop="image" content="{{{url}}}{{{facebook.image}}}">
    <!-- twitter card -->
    <meta name="twitter:card" content="{{{twitter.card}}}">
    <meta name="twitter:image" content="{{{url}}}{{{twitter.image}}}">
    <meta name="twitter:title" content="{{{title}}}">
    <meta name="twitter:description" content="{{{description}}}">
    <meta name="twitter:creator" content="{{{author}}}">
    <meta name="twitter:image:src" content="{{{url}}}{{{twitter.image}}}">
    <!-- facebook card -->
    <meta property="og:locale" content="{{{locale}}}">
    <meta property="og:type" content="{{{facebook.type}}}">
    <meta property="og:title" content="{{{title}}}">
    <meta property="og:description" content="{{{description}}}">
    <meta property="og:url" content="{{{url}}}">
    <meta property="og:image" content="{{{url}}}{{{facebook.image}}}">
    <meta property="og:image:secure_url" content="{{{url}}}{{{facebook.image}}}" />
    <meta property="og:image:width" content="{{{facebook.width}}}" />
    <meta property="og:image:height" content="{{{facebook.height}}}" />
    <meta property="og:site_name" content="{{{name}}}">

    <link rel="apple-touch-icon" sizes="180x180" href="{{{favicon.ios180}}}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{{favicon.png32}}}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{{favicon.png16}}}">
    <link rel='shortcut icon' type='image/x-icon' href='{{{favicon.ico}}}' />
    {{{notFoundStyles}}}
</head>

<body>
    <h1>404</h1>
</body>

</html>