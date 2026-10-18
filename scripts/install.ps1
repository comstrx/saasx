param ( [string] $Dir = '', [string] $From = '' )

Set-StrictMode -Version Latest

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$repo = ''
$tag = ''
$id = ''
$bin = ''

function Write-Step ( [string] $Text ) {

    Write-Information $Text -InformationAction Continue

}
function Get-Target {

    $native = [System.Environment]::GetEnvironmentVariable('PROCESSOR_ARCHITECTURE', 'Machine')
    $arch = if ($env:PROCESSOR_ARCHITEW6432) { $env:PROCESSOR_ARCHITEW6432 } elseif ($native) { $native } else { $env:PROCESSOR_ARCHITECTURE }

    switch ($arch) {
        'AMD64' { return 'x86_64-pc-windows-msvc' }
        'ARM64' { return 'aarch64-pc-windows-msvc' }
        default { throw "unsupported CPU: $arch" }
    }

}
function Get-Asset ( [string] $Name, [string] $Into, [string] $Source ) {

    $path = Join-Path $Into $Name

    if ($Source) { Copy-Item -LiteralPath (Join-Path $Source $Name) -Destination $path }
    else { Invoke-WebRequest -UseBasicParsing -Uri "https://github.com/$repo/releases/download/$tag/$Name" -OutFile $path }

    return $path

}
function Invoke-Installer ( [string] $Into, [string] $Source ) {

    if (-not ($repo -and $tag -and $id)) { throw 'this installer was never stamped for a release' }

    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

    $version = $tag.TrimStart('v')
    $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ([System.IO.Path]::GetRandomFileName())

    if ($bin) {

        $triple = Get-Target
        $base = "$id-$version-$triple"
        if (-not $Into) { $Into = Join-Path $HOME '.local\bin' }
        Write-Step "installing $id $tag for $triple"

    }
    else {

        $base = "$id-$version"
        if (-not $Into) { $Into = Join-Path (Get-Location) $id }
        Write-Step "unpacking $id $tag"

    }

    New-Item -ItemType Directory -Path $tmp | Out-Null

    try {

        $archive = Get-Asset "$base.zip" $tmp $Source
        $sum = Get-Asset "$base.zip.sha256" $tmp $Source
        $parts = (Get-Content -LiteralPath $sum -Raw).Trim() -split '\s+'

        if ($parts.Count -lt 2) { throw "malformed checksum file for $base.zip" }
        if ($parts[1] -ne "$base.zip") { throw "the checksum file names $($parts[1]), not $base.zip" }
        if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ne $parts[0]) { throw "checksum mismatch for $base.zip" }

        Expand-Archive -LiteralPath $archive -DestinationPath $tmp

        $root = Join-Path $tmp $base

        if (-not $bin) {

            if (-not (Test-Path -LiteralPath $root -PathType Container)) { throw "$base is missing from $base.zip" }

            New-Item -ItemType Directory -Force -Path $Into | Out-Null
            if (Get-ChildItem -LiteralPath $Into -Force | Select-Object -First 1) { throw "$Into is not empty" }
            Get-ChildItem -LiteralPath $root -Force | Move-Item -Destination $Into

            Write-Step "unpacked $Into"
            return

        }

        $file = Join-Path $root "$bin.exe"

        if (-not (Test-Path -LiteralPath $file)) { throw "$bin.exe is missing from $base.zip" }

        New-Item -ItemType Directory -Force -Path $Into | Out-Null
        Move-Item -Force -LiteralPath $file -Destination (Join-Path $Into "$bin.exe")

        Write-Step "installed $(Join-Path $Into "$bin.exe")"

        if (($env:PATH -split [System.IO.Path]::PathSeparator) -notcontains $Into) { Write-Step "add $Into to PATH to run $bin" }

    }
    finally {

        Remove-Item -Recurse -Force -LiteralPath $tmp -ErrorAction SilentlyContinue

    }

}

Invoke-Installer $Dir $From
