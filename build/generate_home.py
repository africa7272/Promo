# -*- coding: utf-8 -*-
import json, pathlib, datetime, html, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "articles.json"
TPL  = ROOT / "templates" / "index.html"
OUT  = ROOT / "index.html"

PLACEHOLDER_IMAGE = "/assets/images/placeholder.svg"

def esc(s: str) -> str:
    return html.escape(s or "")

def slugify(s: str) -> str:
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9\-]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")

def load_db():
    with open(DATA, "r", encoding="utf-8") as f:
        db = json.load(f)
    for a in db.get("articles", []):
        a.setdefault("reading", "5 мин")
        a.setdefault("cover", PLACEHOLDER_IMAGE)
        a.setdefault("tags", [])
        a.setdefault("hub", "general")
    return db

def card_article(a: dict) -> str:
    return f"""
<article class="card">
  <a href="/ai/{esc(a['slug'])}/" class="thumb" aria-label="{esc(a['title'])}">
    <img alt="" src="{esc(a.get('cover', PLACEHOLDER_IMAGE))}">
  </a>
  <div class="body">
    <div class="meta">
      <span>{esc(a.get('date',''))}</span>
      <span>•</span>
      <span class="reading">{esc(a.get('reading',''))}</span>
    </div>
    <h3><a href="/ai/{esc(a['slug'])}/">{esc(a['title'])}</a></h3>
    <p>{esc(a.get('excerpt',''))}</p>
  </div>
  <div class="tags">
    {"".join(f'<a class="tag" href="/tags/{slugify(t)}/">#{esc(t)}</a>' for t in a.get("tags", []))}
  </div>
</article>""".strip()

def card_hub(h: dict) -> str:
    return f"""
<article class="card">
  <a class="thumb" href="/hubs/{esc(h['slug'])}/" aria-label="{esc(h['title'])}">
    <img alt="" src="{PLACEHOLDER_IMAGE}">
  </a>
  <div class="body">
    <h3><a href="/hubs/{esc(h['slug'])}/">{esc(h['title'])}</a></h3>
    <p>{esc(h.get('desc',''))}</p>
  </div>
  <div class="tags"><span class="tag">#{esc(h['slug'])}</span></div>
</article>""".strip()

def build():
    db = load_db()

    # свежие сверху; если дата не ISO -> в конец
    def sort_key(a):
        try:
            return datetime.date.fromisoformat(a.get("date","0001-01-01"))
        except Exception:
            return datetime.date(1,1,1)

    articles_sorted = sorted(db.get("articles", []), key=sort_key, reverse=True)
    article_cards = "\n".join(card_article(a) for a in articles_sorted)
    hub_cards     = "\n".join(card_hub(h) for h in db.get("hubs", []))

    # теги по частоте
    tag_freq = {}
    for a in db.get("articles", []):
        for t in a.get("tags", []):
            tag_freq[t] = tag_freq.get(t, 0) + 1
    tag_badges = " ".join(
        f'<a class="badge" href="/tags/{slugify(t)}/">#{esc(t)} ({n})</a>'
        for t, n in sorted(tag_freq.items(), key=lambda x: (-x[1], x[0].lower()))
    ) or '<span class="badge">Пока тегов нет</span>'

    html_out = (TPL.read_text(encoding="utf-8")
        .replace("{{ARTICLE_CARDS}}", article_cards or "<p>Пока нет статей.</p>")
        .replace("{{HUB_CARDS}}", hub_cards or "<p>Пока нет разделов.</p>")
        .replace("{{TAG_BADGES}}", tag_badges)
        .replace("{{YEAR}}", str(datetime.date.today().year))
    )
    OUT.write_text(html_out, encoding="utf-8")
    print("✓ Главная сгенерирована:", OUT)

if __name__ == "__main__":
    build()
