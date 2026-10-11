# =============================================================================
#  KED - generation du site statique (FR / EN / LB)
#  Usage : clic droit > "Executer avec PowerShell", ou dans un terminal :
#          powershell -ExecutionPolicy Bypass -File tools\build.ps1
#  Les textes sont dans tools\i18n.json, les gabarits dans tools\templates\.
#  Les points de vente ne passent PAS par ce script : data\points-de-vente.js
# =============================================================================
$ErrorActionPreference = 'Stop'
$tools = $PSScriptRoot
$site  = Split-Path $tools -Parent
$utf8  = New-Object System.Text.UTF8Encoding($false)
$BASE  = 'https://www.ked.lu/'
$LANGS = @('fr', 'en', 'lb')

function Read-Utf8($p) { return [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8) }
function Write-Utf8($p, $text) {
  $d = Split-Path $p -Parent
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
  [System.IO.File]::WriteAllText($p, $text, $utf8)
}
function Esc($s) {
  if ($null -eq $s) { return '' }
  return ([string]$s).Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;')
}
function Fill($tpl, $map) {
  return [regex]::Replace($tpl, '\{\{(\w+)\}\}', {
    param($m)
    $k = $m.Groups[1].Value
    if ($map.ContainsKey($k)) { return [string]$map[$k] }
    Write-Warning "Cle manquante dans i18n.json : $k"
    return ''
  })
}

$i18n = (Read-Utf8 "$tools\i18n.json") | ConvertFrom-Json
$T = @{}
foreach ($n in 'layout', 'header', 'footer', 'home', 'legal') { $T[$n] = Read-Utf8 "$tools\templates\$n.html" }

function LangPath($l) { if ($l -eq 'fr') { return '' } else { return "$l/" } }
function PagePath($page) { if ($page -eq 'legal') { return 'informations-legales/' } else { return '' } }
function RootFor($l, $page) {
  $depth = 0
  if ($l -ne 'fr') { $depth++ }
  if ($page -eq 'legal') { $depth++ }
  return ('../' * $depth)
}

# -------------------------------------------------------------- pages legales
function Linkify($s) {
  $s = [regex]::Replace($s, '(https?://[^\s<]+?)(\.?)(?=\s|$)', '<a href="$1" target="_blank" rel="noopener">$1</a>$2')
  $s = [regex]::Replace($s, '(?<![/\w.])(www\.[\w.-]+\.[a-z]{2,})', '<a href="https://$1" target="_blank" rel="noopener">$1</a>')
  $s = [regex]::Replace($s, '(?<![\w.+-])([\w.+-]+@[\w-]+\.[a-z]{2,})', '<a href="mailto:$1">$1</a>')
  return $s
}

function Build-Legal($lang, $L) {
  $lines = [System.IO.File]::ReadAllLines("$tools\legal-source\$lang.txt", [System.Text.Encoding]::UTF8)
  $titles = @($L.legal.titles) | Sort-Object { $_.Length } -Descending
  $subheads = @($L.legal.subheads)
  $zw = [string][char]0x200B
  $blocks = New-Object System.Collections.ArrayList
  function Add-Block($type, $text, $orig) { [void]$blocks.Add(@{ type = $type; text = $text; orig = $orig }) }

  foreach ($ln in $lines) {
    $m = [regex]::Match($ln, '^\[(\w+)\]\s?(.*)$')
    if ($m.Success) { $tag = $m.Groups[1].Value; $t = $m.Groups[2].Value } else { $tag = 'cont'; $t = $ln }
    $t = ($t.Replace($zw, '') -replace '\s+', ' ').Trim()
    if (-not $t) { continue }
    if ($t -eq $L.legal.link_label) { continue }
    if ($tag -eq 'cont') { Add-Block 'p' $t $t; continue }
    if ($tag -eq 'li') { Add-Block 'li' $t $t; continue }
    if ($t -match '^\d+\.\s') { Add-Block 'h2' $t $t; continue }
    $mm = [regex]::Match($t, '^((?:\d+\.\d+)|(?:Article|Artikel)\s+\d+\s*:)\s*(.*)$')
    if ($mm.Success) {
      $prefix = $mm.Groups[1].Value; $rest = $mm.Groups[2].Value; $head = $null; $body = ''
      foreach ($ti in $titles) {
        if ($rest -eq $ti) { $head = $ti; break }
        if ($rest.StartsWith($ti + ' ')) { $head = $ti; $body = $rest.Substring($ti.Length).Trim(); break }
      }
      if ($head) {
        Add-Block 'h3' "$prefix $head" "$prefix $head"
        if ($body) { Add-Block 'p' $body $body }
      } elseif ($rest.Length -lt 60) { Add-Block 'h3' $t $t }
      else { Add-Block 'p' $t $t }
      continue
    }
    if ($subheads -contains $t) { Add-Block 'h3' $t $t; continue }
    if ($t.Length -le 30 -and $t.EndsWith(':')) { Add-Block 'h3' ($t.TrimEnd(':', ' ')) $t; continue }
    Add-Block 'p' $t $t
  }

  # mises a jour (hebergement, carte, cookies) definies dans i18n.json
  $out = New-Object System.Collections.ArrayList
  foreach ($b in $blocks) {
    $drop = $false
    foreach ($r in @($L.legal.overrides)) {
      if ($r.match -and ($b.orig.Contains($r.match) -or $b.text.Contains($r.match))) {
        if ($r.delete) { $drop = $true }
        elseif ($r.whole) { $b.text = $r.whole; if ($b.type -eq 'h3') { $b.type = 'p' } }
        break
      }
      if ($r.find -and $b.text.Contains($r.find)) { $b.text = $b.text.Replace($r.find, $r.replace) }
    }
    if (-not $drop) { [void]$out.Add($b) }
  }

  # rendu HTML
  $sb = New-Object System.Text.StringBuilder
  $inList = $false
  $prev = $null
  foreach ($b in $out) {
    if ($prev -and $prev.type -eq 'h2' -and $b.type -eq 'p' -and $prev.text.Contains($b.text)) { $prev = $b; continue }
    if ($b.type -ne 'li' -and $inList) { [void]$sb.AppendLine('      </ul>'); $inList = $false }
    $h = Linkify (Esc $b.text)
    switch ($b.type) {
      'h2' { [void]$sb.AppendLine("      <h2>$h</h2>") }
      'h3' { [void]$sb.AppendLine("      <h3>$h</h3>") }
      'li' {
        if (-not $inList) { [void]$sb.AppendLine('      <ul>'); $inList = $true }
        [void]$sb.AppendLine("        <li>$h</li>")
      }
      default { [void]$sb.AppendLine("      <p>$h</p>") }
    }
    $prev = $b
  }
  if ($inList) { [void]$sb.AppendLine('      </ul>') }
  return $sb.ToString().TrimEnd()
}

# -------------------------------------------------------------- pages
$jsonld = @'
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"KED","legalName":"Kimster Company S.\u00e0 r.l.-S","url":"https://www.ked.lu/","logo":"https://www.ked.lu/assets/img/logo-ked.png","email":"contact@ked.lu","address":{"@type":"PostalAddress","streetAddress":"14 rue de la Chapelle","postalCode":"L-8017","addressLocality":"Strassen","addressCountry":"LU"},"sameAs":["https://www.instagram.com/ked_energy/","https://www.tiktok.com/@ked.energy"]}</script>
'@

foreach ($lang in $LANGS) {
  $L = $i18n.$lang
  foreach ($page in 'home', 'legal') {
    $root = RootFor $lang $page
    $map = @{}
    foreach ($p in $L.PSObject.Properties) { if ($p.Value -is [string]) { $map[$p.Name] = Esc $p.Value } }

    $map['root'] = $root
    $map['home'] = if ($page -eq 'home') { '' } else { '../' }
    $map['legal_href'] = $root + (LangPath $lang) + 'informations-legales/'
    $map['canonical'] = $BASE + (LangPath $lang) + (PagePath $page)

    $alt = New-Object System.Text.StringBuilder
    foreach ($l2 in $LANGS) { [void]$alt.AppendLine("<link rel=`"alternate`" hreflang=`"$l2`" href=`"$BASE$(LangPath $l2)$(PagePath $page)`">") }
    [void]$alt.Append("<link rel=`"alternate`" hreflang=`"x-default`" href=`"$BASE$(PagePath $page)`">")
    $map['alternates'] = $alt.ToString()

    $ll = New-Object System.Text.StringBuilder
    foreach ($l2 in $LANGS) {
      $cur = if ($l2 -eq $lang) { ' aria-current="true"' } else { '' }
      [void]$ll.AppendLine("        <a href=`"$root$(LangPath $l2)$(PagePath $page)`" hreflang=`"$l2`" lang=`"$l2`"$cur>$($l2.ToUpper())</a>")
    }
    $map['lang_links'] = $ll.ToString().TrimEnd()

    if ($page -eq 'home') {
      $map['page_title'] = Esc $L.title
      $map['page_description'] = Esc $L.description
      $map['jsonld'] = $jsonld.Trim()
      $cfg = [ordered]@{ lang = $lang; root = $root; partners_pause = $L.partners_pause; partners_play = $L.partners_play; js = $L.js }
      $cfgJson = ($cfg | ConvertTo-Json -Depth 8 -Compress)
      $map['scripts'] = "<script>window.KED_I18N = $cfgJson;</script>`n<script src=`"${root}data/points-de-vente.js`"></script>`n<script src=`"${root}assets/js/cantons.js`"></script>`n<script src=`"${root}assets/js/app.js`"></script>"
      $map['content'] = Fill $T.home $map
    } else {
      $map['page_title'] = Esc $L.legal_meta_title
      $map['page_description'] = Esc $L.legal_description
      $map['jsonld'] = ''
      $map['scripts'] = ''
      $map['legal_body'] = Build-Legal $lang $L
      $map['content'] = Fill $T.legal $map
    }
    $map['header'] = Fill $T.header $map
    $map['footer'] = Fill $T.footer $map
    $html = Fill $T.layout $map

    $out = Join-Path $site ((LangPath $lang) + (PagePath $page) + 'index.html')
    Write-Utf8 $out $html
    Write-Host ("ecrit : " + $out.Substring($site.Length + 1))
  }
}

# -------------------------------------------------------------- redirections depuis les anciennes URL Wix
function Redirect($rel, $target) {
  $h = "<!doctype html><html><head><meta charset=`"utf-8`"><meta name=`"robots`" content=`"noindex`"><title>KED</title><meta http-equiv=`"refresh`" content=`"0; url=$target`"><link rel=`"canonical`" href=`"$target`"><script>location.replace('$target');</script></head><body><a href=`"$target`">ked.lu</a></body></html>"
  Write-Utf8 (Join-Path $site $rel) $h
}
$accent = 'informations-l' + [char]0x00E9 + 'gales'
Redirect 'boutique\index.html' '../'
Redirect 'en\boutique\index.html' '../'
Redirect 'lb\boutique\index.html' '../'
Redirect "$accent\index.html" '../informations-legales/'
Redirect "en\$accent\index.html" '../informations-legales/'
Redirect "lb\$accent\index.html" '../informations-legales/'
# anciennes fiches produits et categorie de la boutique Wix
$slugs = @('pack-24-canettes-ked-mixte', 'copie-de-pack-24-canettes-ked-original', 'copie-de-pack-24-canettes-ked-zero')
foreach ($pre in @('', 'en\', 'lb\')) {
  foreach ($s in $slugs) { Redirect "${pre}product-page\$s\index.html" '../../#produit' }
  Redirect "${pre}category\all-products\index.html" '../../'
}

# -------------------------------------------------------------- sitemap, robots, 404
$sm = New-Object System.Text.StringBuilder
[void]$sm.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sm.AppendLine('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">')
foreach ($page in 'home', 'legal') {
  foreach ($lang in $LANGS) {
    [void]$sm.AppendLine("  <url><loc>$BASE$(LangPath $lang)$(PagePath $page)</loc>")
    foreach ($l2 in $LANGS) { [void]$sm.AppendLine("    <xhtml:link rel=`"alternate`" hreflang=`"$l2`" href=`"$BASE$(LangPath $l2)$(PagePath $page)`"/>") }
    [void]$sm.AppendLine('  </url>')
  }
}
[void]$sm.AppendLine('</urlset>')
Write-Utf8 "$site\sitemap.xml" $sm.ToString()
Write-Utf8 "$site\robots.txt" "User-agent: *`nAllow: /`n`nSitemap: ${BASE}sitemap.xml`n"
Write-Utf8 "$site\.nojekyll" ''

$nf = @'
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>404 - KED</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
<main class="legal"><div class="wrap">
  <img src="/assets/img/logo-ked.png" alt="KED" width="240" height="66" style="margin-bottom:48px">
  <h1>404</h1>
  <div class="legal-body">
    <p>Page introuvable &middot; Page not found &middot; S&auml;it net fonnt</p>
    <p><a class="btn btn--primary" href="/">FR</a> <a class="btn" href="/en/">EN</a> <a class="btn" href="/lb/">LB</a></p>
  </div>
</div></main>
</body>
</html>
'@
Write-Utf8 "$site\404.html" $nf
Write-Host 'Termine.'
