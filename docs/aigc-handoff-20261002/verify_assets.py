"""Verify this handoff without rendering, downloads, or paid generation."""
import hashlib
import json
import re
import sys
import wave
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
try:
    from PIL import Image
except ImportError:
    Image = None


def verify():
    manifest = json.loads((ROOT / 'ASSET_MANIFEST.json').read_text())
    errors = []
    images = audio = links = 0
    declared = set()
    for entry in manifest['files']:
        rel = entry['path']
        path = ROOT / rel
        declared.add(rel)
        if not path.is_file() or not path.resolve().is_relative_to(ROOT):
            errors.append('missing/unsafe: ' + rel)
            continue
        data = path.read_bytes()
        if len(data) != entry['bytes'] or hashlib.sha256(data).hexdigest() != entry['sha256']:
            errors.append('hash/size: ' + rel)
        if path.suffix.lower() in {'.png', '.jpg', '.jpeg'}:
            images += 1
            if Image:
                try:
                    with Image.open(path) as im:
                        im.verify()
                    with Image.open(path) as im:
                        im.load()
                        if im.size != (entry['width'], entry['height']):
                            errors.append('dimensions: ' + rel)
                except Exception as exc:
                    errors.append('decode: ' + rel + ': ' + str(exc))
        if path.suffix.lower() == '.wav':
            audio += 1
            try:
                with wave.open(str(path)) as stream:
                    expected = stream.getnframes() * stream.getnchannels() * stream.getsampwidth()
                    if len(stream.readframes(stream.getnframes())) != expected:
                        errors.append('audio truncated: ' + rel)
            except Exception as exc:
                errors.append('audio decode: ' + rel + ': ' + str(exc))
        if path.suffix in {'.md', '.html'}:
            text = data.decode('utf-8')
            targets = re.findall(r'!?\[[^\]]*\]\(([^)]+)\)', text) if path.suffix == '.md' else re.findall(r'(?:href|src)="([^"]+)"', text)
            for target in targets:
                target = target.strip('<>')
                parsed = urlsplit(target)
                if parsed.scheme or target.startswith('#'):
                    continue
                links += 1
                dest = (path.parent / unquote(parsed.path)).resolve()
                if not dest.is_relative_to(ROOT) or not dest.exists():
                    errors.append('link: ' + rel + ' -> ' + target)
    actual = {str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in p.parts}
    expected = declared | {'ASSET_MANIFEST.json', 'SHA256SUMS.txt'}
    if actual != expected:
        errors.append('inventory mismatch: ' + repr(sorted(actual ^ expected)))
    for line in (ROOT / 'SHA256SUMS.txt').read_text().splitlines():
        digest, rel = line.split('  ', 1)
        path = ROOT / rel
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            errors.append('SHA256SUMS: ' + rel)
    result = {'files': len(actual), 'manifest_entries': len(declared), 'primary_images': manifest['summary']['primary_images'], 'raster_files': images, 'images_fully_decoded': images if Image else 0, 'wav_files_fully_read': audio, 'relative_links_checked': links, 'errors': errors}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if Image is None:
        print('Pillow unavailable: image decoding was not performed in this run.', file=sys.stderr)
    return bool(errors)


if __name__ == '__main__':
    sys.exit(verify())
