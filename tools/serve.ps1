# Minimal static file server for previewing the generated site.
# Works both from the conversion workspace and from the site's own tools/ folder.
param(
    [int]$Port = 8099,
    [string]$Root = $(
        $parent = Split-Path -Parent $PSScriptRoot
        if (Test-Path (Join-Path $parent 'index.html')) { $parent }
        else { Join-Path $parent 'rasalad-website' }
    )
)

$ErrorActionPreference = 'Stop'
$Root = [IO.Path]::GetFullPath($Root)

$mime = @{
    '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
    '.js' = 'text/javascript; charset=utf-8'; '.json' = 'application/json'
    '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'
    '.gif' = 'image/gif'; '.svg' = 'image/svg+xml'; '.webp' = 'image/webp'
    '.ico' = 'image/x-icon'; '.woff' = 'font/woff'; '.woff2' = 'font/woff2'
    '.ttf' = 'font/ttf'; '.eot' = 'application/vnd.ms-fontobject'
    '.mov' = 'video/quicktime'; '.mp4' = 'video/mp4'; '.webm' = 'video/webm'
    '.xml' = 'application/xml'; '.txt' = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "serving $Root on http://127.0.0.1:$Port/"

function Send-Response($stream, [int]$status, [string]$statusText, [string]$contentType, [byte[]]$body, [bool]$headOnly, [string]$extra = '') {
    $header = "HTTP/1.1 $status $statusText`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nAccept-Ranges: bytes`r`nCache-Control: no-store`r`nConnection: close`r`n$extra`r`n"
    $hb = [Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($hb, 0, $hb.Length)
    if (-not $headOnly -and $body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
    $stream.Flush()
}

while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
        $client.ReceiveTimeout = 5000
        $client.SendTimeout = 60000
        $stream = $client.GetStream()
        $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::ASCII)

        $requestLine = $reader.ReadLine()
        if (-not $requestLine) { $client.Close(); continue }
        $rangeHeader = $null
        while ($true) {
            $line = $reader.ReadLine()
            if ($null -eq $line -or $line -eq '') { break }
            if ($line -match '^(?i)Range:\s*bytes=(\d*)-(\d*)') { $rangeHeader = @($matches[1], $matches[2]) }
        }

        $parts = $requestLine -split ' '
        $method = $parts[0]
        $target = ($parts[1] -split '\?')[0]
        $target = [Uri]::UnescapeDataString($target)
        $headOnly = ($method -eq 'HEAD')

        $rel = $target.TrimStart('/') -replace '/', '\'
        $path = [IO.Path]::GetFullPath((Join-Path $Root $rel))
        if (-not $path.StartsWith($Root)) {
            Send-Response $stream 403 'Forbidden' 'text/plain' ([Text.Encoding]::UTF8.GetBytes('forbidden')) $headOnly
            $client.Close(); continue
        }
        if (Test-Path -LiteralPath $path -PathType Container) { $path = Join-Path $path 'index.html' }

        if (Test-Path -LiteralPath $path -PathType Leaf) {
            $ext = [IO.Path]::GetExtension($path).ToLowerInvariant()
            $ct = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
            $fi = Get-Item -LiteralPath $path
            if ($rangeHeader) {
                $from = if ($rangeHeader[0] -ne '') { [int64]$rangeHeader[0] } else { 0 }
                $to = if ($rangeHeader[1] -ne '') { [int64]$rangeHeader[1] } else { $fi.Length - 1 }
                if ($to -ge $fi.Length) { $to = $fi.Length - 1 }
                $len = $to - $from + 1
                $buf = New-Object byte[] $len
                $fs = [IO.File]::OpenRead($path)
                try { $fs.Seek($from, 'Begin') | Out-Null; $read = 0; while ($read -lt $len) { $n = $fs.Read($buf, $read, $len - $read); if ($n -le 0) { break }; $read += $n } } finally { $fs.Dispose() }
                Send-Response $stream 206 'Partial Content' $ct $buf $headOnly ("Content-Range: bytes $from-$to/$($fi.Length)`r`n")
            } else {
                $bytes = [IO.File]::ReadAllBytes($path)
                Send-Response $stream 200 'OK' $ct $bytes $headOnly
            }
        } else {
            $custom = Join-Path $Root '404.html'
            if (Test-Path -LiteralPath $custom) {
                Send-Response $stream 404 'Not Found' 'text/html; charset=utf-8' ([IO.File]::ReadAllBytes($custom)) $headOnly
            } else {
                Send-Response $stream 404 'Not Found' 'text/plain' ([Text.Encoding]::UTF8.GetBytes('not found')) $headOnly
            }
        }
    } catch {
        Write-Host "error: $($_.Exception.Message)"
    } finally {
        try { $client.Close() } catch {}
    }
}
