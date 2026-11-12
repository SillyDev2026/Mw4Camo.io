#!/usr/bin/env python3
"""Daily official-source change monitor for GitHub Pages.

Discover patch articles from the Call of Duty patch index; read dated change sections;
retain short sourced excerpts and link to full notes. Never invent balance values.
The watcher maintains source hashes and run health, preserving existing data when
publisher markup or network access changes. No credentials, telemetry, or API keys.
"""
import argparse
import hashlib
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PATCH_JSON = ROOT / 'data' / 'patches.json'
PATCH_JS = ROOT / 'data' / 'patches.js'
STATE_JSON = ROOT / 'data' / 'source-state.json'
STATUS_JSON = ROOT / 'data' / 'update-status.json'
STATUS_JS = ROOT / 'data' / 'update-status.js'
HUB = 'https://www.callofduty.com/patchnotes'
PINNED = {
    'MW4': 'https://www.callofduty.com/patchnotes/2026/11/call-of-duty-modern-warfare-4-season-1-patch-notes',
    'Warzone': 'https://www.callofduty.com/patchnotes/2026/11/call-of-duty-mw4-warzone-season-1-patch-notes',
}
MONTHS = {name.lower(): num for num, name in enumerate('January February March April May June July August September October November December'.split(), 1)}
DATE_RE = re.compile(r'\b(' + '|'.join(MONTHS) + r')\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(20\d{2}))?\b', re.I)
DAY_RE = re.compile(r'^(?:(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+)?(?:' + '|'.join(MONTHS) + r')\s+\d{1,2}', re.I)
YEAR_URL_RE = re.compile(r'/patchnotes/(20\d{2})/')
ARTICLE_RE = re.compile(r'^/patchnotes/20\d{2}/(?:0?[1-9]|1[0-2])/[a-z0-9-]+$')
SECTION_LIMIT = 14
POINTS_LIMIT = 3
MAX_SOURCES = 12


def clean(text):
    return ' '.join(str(text or '').split())


def date_of(heading, default_year=2026):
    text = clean(heading)
    if len(text) > 80 or not DAY_RE.match(text):
        return None
    match = DATE_RE.search(text)
    if not match:
        return None
    try:
        return datetime(int(match.group(3) or default_year), MONTHS[match.group(1).lower()], int(match.group(2)), tzinfo=timezone.utc).date().isoformat()
    except ValueError:
        return None


def valid_url(raw):
    parsed = urllib.parse.urlparse(urllib.parse.urljoin(HUB, raw))
    if parsed.scheme != 'https' or parsed.hostname not in ('callofduty.com', 'www.callofduty.com'):
        return None
    path = parsed.path.lower().rstrip('/')
    if not ARTICLE_RE.match(path):
        return None
    return 'https://www.callofduty.com' + path


def game_of(url, label=''):
    path = urllib.parse.urlparse(url).path.lower()
    if 'warzone' in path:
        return 'Warzone'
    if any(x in path for x in ('modern-warfare-4', 'mw4')):
        return 'MW4'
    return None


def discover_sources(html):
    soup = BeautifulSoup(html, 'html.parser')
    found = {}
    for a in soup.find_all('a', href=True):
        url = valid_url(a['href'])
        if not url:
            continue
        game = game_of(url, clean(a.get_text(' ', strip=True)))
        if game:
            found[url] = game
    return found


def parse_updates(html, game, source):
    soup = BeautifulSoup(html, 'html.parser')
    for tag in soup(['script', 'style', 'noscript', 'nav', 'header', 'footer']):
        tag.decompose()
    year_match = YEAR_URL_RE.search(source)
    default_year = int(year_match.group(1)) if year_match else datetime.now(timezone.utc).year
    current, groups = None, []
    for tag in soup.find_all(['h2', 'h3', 'h4', 'h5', 'p', 'li']):
        content = clean(tag.get_text(' ', strip=True))
        if not content:
            continue
        day = date_of(content, default_year) if tag.name in ('h2', 'h3') else None
        if day:
            if current:
                groups.append(current)
            current = {'date': day, 'game': game, 'source': source, 'sections': [], 'raw': [], 'section': None}
            continue
        if not current:
            continue
        if tag.name in ('h2', 'h3', 'h4', 'h5') and len(content) < 90:
            current['section'] = {'title': content.title()[:85], 'points': []}
            current['sections'].append(current['section'])
        elif tag.name in ('p', 'li') and len(content) > 23:
            current['raw'].append(content)
            if current['section'] is None:
                current['section'] = {'title': 'General', 'points': []}
                current['sections'].append(current['section'])
            points = current['section']['points']
            if len(points) < POINTS_LIMIT and content not in points:
                points.append((content[:145].rstrip(' ,;.') + ('…' if len(content)>145 else '')))
    if current:
        groups.append(current)
    by_date = {}
    for group in groups:
        sections = [section for section in group['sections'] if section['points']][:SECTION_LIMIT]
        if not sections:
            continue
        full = '\n'.join(group['raw'])
        group['fingerprint'] = hashlib.sha256(full.encode('utf-8')).hexdigest()[:16]
        group['sections'] = sections
        group.pop('raw', None)
        group.pop('section', None)
        prev = by_date.get(group['date'])
        if not prev or sum(len(x['points']) for x in sections) > sum(len(x['points']) for x in prev['sections']):
            by_date[group['date']] = group
    return list(by_date.values())


def convert_reader_markdown(source, body):
    """Convert a public reader copy of an official article back to DOM-shaped HTML.

    The URL Source marker must match the requested official article exactly;
    reader output with an unverified origin is rejected.
    """
    if 'Markdown Content:' not in body:
        raise ValueError('Public reader returned no Markdown Content marker')
    head, markdown_text = body.split('Markdown Content:', 1)
    match = re.search(r'^URL Source:\s*(https?://\S+)', head, re.M | re.I)
    if not match or valid_url(match.group(1)) != valid_url(source) and source != HUB:
        raise ValueError('Public reader URL Source did not match official request')
    if source == HUB and urllib.parse.urlparse(match.group(1)).hostname not in ('www.callofduty.com', 'callofduty.com'):
        raise ValueError('Public reader index origin not official')
    if len(markdown_text) < 250:
        raise ValueError('Public reader returned too little text')
    # Remove common linked images: their alt text and link are not patch content.
    markdown_text = re.sub(r'!\[[^]]*\]\([^)]*\)', '', markdown_text)
    try:
        import markdown
    except ImportError as exc:
        raise RuntimeError('Optional public reader fallback needs Markdown Python package') from exc
    return markdown.markdown(markdown_text, extensions=['extra'])


def fetch_page(url, retries=2):
    """Request the official source directly, then try a reader fallback if blocked."""
    request = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36', 'Accept':'text/html'})
    last = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=17) as response:
                final = urllib.parse.urlparse(response.url)
                if final.hostname not in ('www.callofduty.com', 'callofduty.com'):
                    raise ValueError('Redirected to non-official host')
                return response.read(3_000_000).decode('utf-8', 'replace')
        except Exception as error:
            last = error
            if attempt + 1 < retries:
                time.sleep(1)
    # GitHub runners may be blocked by the publisher even while the article is live.
    # The reader is only a fallback for public official pages and requires origin
    # and payload verification. Canonical source links remain official.
    proxy = 'https://r.jina.ai/' + url
    try:
        mirror = urllib.request.Request(proxy, headers={'Accept':'text/plain', 'User-Agent':'MW4Camo-Patch-Reader/1.1'})
        with urllib.request.urlopen(mirror, timeout=20) as response:
            if urllib.parse.urlparse(response.url).hostname != 'r.jina.ai':
                raise ValueError('Reader redirected away from r.jina.ai')
            raw = response.read(3_000_000).decode('utf-8', 'replace')
        page = convert_reader_markdown(url, raw)
        print('FALLBACK: validated public reader copy for', url, file=sys.stderr)
        return page
    except Exception as reader_error:
        raise RuntimeError(f'Official fetch failed: {last}; reader fallback failed: {reader_error}') from reader_error


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def write_js(path, global_name, value):
    path.write_text('window.' + global_name + ' = ' + json.dumps(value, ensure_ascii=False, separators=(',',':')) + ';\n', encoding='utf-8')


def update(dry_run=False, fetcher=fetch_page):
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    patches = json.loads(PATCH_JSON.read_text(encoding='utf-8'))
    history = json.loads(STATE_JSON.read_text(encoding='utf-8')) if STATE_JSON.exists() else {}
    status = json.loads(STATUS_JSON.read_text(encoding='utf-8')) if STATUS_JSON.exists() else {}
    last_success = status.get('lastSuccessfulAt')
    sources = {url: game for game, url in PINNED.items()}
    source_results = []
    try:
        sources.update(discover_sources(fetcher(HUB)))
        hub_ok = True
    except Exception as error:
        hub_ok = False
        print('WARNING: Official patch hub unavailable:',error, file=sys.stderr)
    # Newest known source pages plus the pinned active season pages, deduplicated.
    fixed = set(PINNED.values())
    discovered = sorted(((u,g) for u,g in sources.items() if u not in fixed),reverse=True)[:MAX_SOURCES-len(fixed)]
    targets = [(url,game) for game,url in PINNED.items()] + discovered
    by_id = {p['id']:p for p in patches}
    found_changes = 0
    successful = 0
    for url, game in targets:
        try:
            article = parse_updates(fetcher(url), game, url)
            if not article:
                raise ValueError('No dated change sections found; site markup might have changed')
            successful += 1
            source_results.append({'game':game,'url':url,'status':'ok','datedSections':len(article)})
        except Exception as error:
            source_results.append({'game':game,'url':url,'status':'error','message':str(error)[:180]})
            print(f'WARNING: {game} article {url}: {error}',file=sys.stderr)
            continue
        for item in article:
            key = f'{game}|{url}|{item["date"]}'
            fingerprint = item['fingerprint']
            old = history.get(key)
            history[key] = fingerprint
            if old == fingerprint:
                continue
            day_id = f'{game.lower()}-{item["date"]}'
            # Initial import of same-date editorial notes should not duplicate them.
            if old is None and day_id in by_id:
                print('Baselined editorial patch',day_id)
                continue
            suffix = hashlib.sha1(url.encode('utf-8')).hexdigest()[:7]
            entry_id = f'official-{game.lower()}-{item["date"]}-{suffix}'
            entry = {
                'id':entry_id,'game':game,'date':item['date'],
                'title':f'Official {game} update · {item["date"]}',
                'source':url,'verified':True,'auto':True,'updatedAt':now,
                'sections':item['sections']
            }
            if entry_id in by_id:
                patches[patches.index(by_id[entry_id])] = entry
            else:
                patches.append(entry)
            by_id[entry_id] = entry
            found_changes += 1
            print('CHANGED',entry_id)
    patches.sort(key=lambda p:(p['date'],p.get('updatedAt',''),p['id']),reverse=True)
    success = successful>0
    status = {
        'lastCheckedAt':now,'lastSuccessfulAt':now if success else last_success,
        'hubChecked':hub_ok,'discoveredSources':len(targets),
        'newEntries':found_changes,'sources':source_results,
        'note': ('Some official source checks failed; previous patch data is retained.'
                 if successful<len(targets) or not hub_ok else 'Official source checks completed.')
    }
    if not dry_run:
        write_json(PATCH_JSON,patches)
        write_js(PATCH_JS,'MW4_PATCHES',patches)
        write_json(STATE_JSON,history)
        write_json(STATUS_JSON,status)
        write_js(STATUS_JS,'MW4_UPDATE_STATUS',status)
    print(f'Source checks: {successful}/{len(targets)}, patch changes: {found_changes}, hub: {"ok" if hub_ok else "fallback"}')
    return status


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    update(dry_run=args.dry_run)
