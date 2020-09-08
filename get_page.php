<?php
$page = trim($argv[1]);
$opts = [
    "http" => [
        "method" => "GET",
        "header" =>
            "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36\r\n" .
            "Content-type: text/html\r\n" .
            "Accept-Language: en\r\n" .
            "charset=utf-8"
    ]
];

$context = stream_context_create($opts);
$html    = file_get_contents($page, false, $context);

// uncomment to debug
// file_put_contents(__DIR__ .'/page.html', $html);

echo $html;
