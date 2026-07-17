$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8085/")
try {
    $listener.Start()
    Write-Output "HTTP Server started on http://localhost:8085/"
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        # Map URL path to local folder path
        $filePath = Join-Path $PSScriptRoot $urlPath
        
        if ($urlPath -eq "/favicon.ico" -and -not (Test-Path $filePath -PathType Leaf)) {
            $response.StatusCode = 204
            $context.Response.Close()
            continue
        }
        
        if (Test-Path $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($extension) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".css" { $contentType = "text/css" }
                ".js" { $contentType = "application/javascript" }
                ".png" { $contentType = "image/png" }
                ".jpg" { $contentType = "image/jpeg" }
                ".jpeg" { $contentType = "image/jpeg" }
                ".ico" { $contentType = "image/x-icon" }
                default { $contentType = "application/octet-stream" }
            }
            
            $response.ContentType = $contentType
            $response.Headers.Add("Cache-Control", "no-store, no-cache, must-revalidate")
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $response.ContentType = "text/plain"
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $context.Response.Close()
    }
} catch {
    Write-Error $_
} finally {
    $listener.Stop()
}
