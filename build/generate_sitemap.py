# -*- coding: utf-8 -*-
import json, pathlib, datetime

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "articles.json"
OUT  = ROOT / "sitemap.xml"
BASE = "https://deals-hub.ru"

def main():
    db = json.loads(DATA.read_text(encoding="utf-8"))
    today = datetime.date.today().isoformat()

    urls = [
        (f"{BASE}/", today, "weekly", "1.0"),
        (f"{BASE}/hubs/", today, "weekly", "0.8"),
        (f"{BASE}/tags/", today, "weekly", "0.6"),
        (f"{BASE}/about/", today, "yearly", "0.3")
    ]
    # хабы
    for h in db.get("hubs", []):
        urls.append((f"{BASE}/hubs/{h['slug']}/", today, "weekly", "0.7"))
    # статьи
    for a in db.get("articles", []):
        lastmod = a.get("date") or today
        urls.append((f"{BASE}/ai/{a['slug']}/", lastmod, "monthly", "0.9"))
    # теги
    tags = set()
    for a in db.get("articles", []):
        for t in a.get("tags", []):
            slug = "".join([c if c.isalnum() or c == "-" else "-" for c in t.lower()]).strip("-")
            tags.add(slug)
    for t in sorted(tags):
        urls.append((f"{BASE}/tags/{t}/", today, "weekly", "0.5"))

    rows = []
    for loc, lastmod, freq, pr in urls:
        rows.append(f"""  <url>
    <loc>{loc}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{pr}</priority>
  </url>""")

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(rows)}
</urlset>
"""
    OUT.write_text(xml, encoding="utf-8")
    print("✓ sitemap.xml обновлён")

if __name__ == "__main__":
    main()
