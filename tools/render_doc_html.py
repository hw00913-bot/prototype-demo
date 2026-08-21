#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import html
import re
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
MD_PATH = ROOT_DIR / 'docs/功能说明文档.md'
DOC_HTML_PATH = ROOT_DIR / 'docs/功能说明文档.html'

def escape(s):
    return html.escape(s)

def parse_markdown_to_html(md_text):
    lines = md_text.split('\n')
    toc = []
    html_parts = []
    
    in_table = False
    table_rows = []
    in_list = False
    list_type = None # 'ul' or 'ol'
    in_blockquote = False
    blockquote_lines = []
    
    def flush_table():
        nonlocal in_table, table_rows, html_parts
        if not in_table or not table_rows:
            in_table = False
            table_rows = []
            return
        
        out = ['<div class="table-wrap"><table>']
        if len(table_rows) >= 2 and re.match(r'^\s*\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?\s*$', table_rows[1]):
            headers = [c.strip() for c in table_rows[0].strip().strip('|').split('|')]
            out.append('<thead><tr>')
            for h in headers:
                out.append(f'<th>{render_inline(h)}</th>')
            out.append('</tr></thead>')
            
            out.append('<tbody>')
            for row in table_rows[2:]:
                cells = [c.strip() for c in row.strip().strip('|').split('|')]
                out.append('<tr>')
                for c in cells:
                    out.append(f'<td>{render_inline(c)}</td>')
                out.append('</tr>')
            out.append('</tbody>')
        else:
            out.append('<tbody>')
            for row in table_rows:
                cells = [c.strip() for c in row.strip().strip('|').split('|')]
                out.append('<tr>')
                for c in cells:
                    out.append(f'<td>{render_inline(c)}</td>')
                out.append('</tr>')
            out.append('</tbody>')
        out.append('</table></div>')
        html_parts.append('\n'.join(out))
        in_table = False
        table_rows = []

    def flush_list():
        nonlocal in_list, list_type, html_parts
        if in_list:
            html_parts.append(f'</{list_type}>')
            in_list = False
            list_type = None

    def flush_blockquote():
        nonlocal in_blockquote, blockquote_lines, html_parts
        if in_blockquote and blockquote_lines:
            content = '<br>'.join([render_inline(l) for l in blockquote_lines])
            html_parts.append(f'<blockquote>{content}</blockquote>')
            in_blockquote = False
            blockquote_lines = []

    def render_inline(text):
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
        text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
        return text

    h1_count = 0
    h2_count = 0
    h3_count = 0

    for line in lines:
        line_strip = line.strip()

        if line_strip.startswith('|') and line_strip.endswith('|'):
            flush_list()
            flush_blockquote()
            in_table = True
            table_rows.append(line_strip)
            continue
        elif in_table:
            flush_table()

        if line_strip.startswith('>'):
            flush_list()
            in_blockquote = True
            blockquote_lines.append(line_strip[1:].strip())
            continue
        elif in_blockquote:
            flush_blockquote()

        if re.match(r'^[-*]\s+', line_strip):
            flush_blockquote()
            if not in_list or list_type != 'ul':
                flush_list()
                in_list = True
                list_type = 'ul'
                html_parts.append('<ul>')
            item_text = re.sub(r'^[-*]\s+', '', line_strip)
            html_parts.append(f'<li>{render_inline(item_text)}</li>')
            continue
        elif re.match(r'^\d+\.\s+', line_strip):
            flush_blockquote()
            if not in_list or list_type != 'ol':
                flush_list()
                in_list = True
                list_type = 'ol'
                html_parts.append('<ol>')
            item_text = re.sub(r'^\d+\.\s+', '', line_strip)
            html_parts.append(f'<li>{render_inline(item_text)}</li>')
            continue
        else:
            if in_list:
                flush_list()

        if line_strip.startswith('# '):
            h1_count += 1
            title = line_strip[2:].strip()
            anchor = f"title-{h1_count}"
            html_parts.append(f'<h1 id="{anchor}">{render_inline(title)}</h1>')
        elif line_strip.startswith('## '):
            h2_count += 1
            title = line_strip[3:].strip()
            anchor = f"sec-{h2_count}"
            toc.append({'level': 2, 'title': title, 'anchor': anchor})
            html_parts.append(f'<h2 id="{anchor}">{render_inline(title)}</h2>')
        elif line_strip.startswith('### '):
            h3_count += 1
            title = line_strip[4:].strip()
            anchor = f"sub-{h3_count}"
            toc.append({'level': 3, 'title': title, 'anchor': anchor})
            html_parts.append(f'<hr class="section-divider">\n<h3 id="{anchor}">{render_inline(title)}</h3>')
        elif line_strip == '---':
            html_parts.append('<hr>')
        elif not line_strip:
            continue
        else:
            html_parts.append(f'<p>{render_inline(line_strip)}</p>')

    flush_table()
    flush_list()
    flush_blockquote()

    return toc, '\n'.join(html_parts)

def generate_doc_html(toc, content_html):
    toc_links = []
    for item in toc:
        cls = 'toc-link h2' if item['level'] == 2 else 'toc-link h3'
        toc_links.append(f'<a href="#{item["anchor"]}" class="{cls}">{escape(item["title"])}</a>')
    toc_html = '\n'.join(toc_links)

    template = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="data:,">
  <title>智能外呼中台与多供应商协同系统 - 功能说明文档</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      background: #F4F6F9;
      color: #1F2937;
      line-height: 1.7;
      font-size: 14px;
    }}
    .doc-layout {{ display: flex; min-height: 100vh; }}
    .doc-sidebar {{
      width: 280px;
      background: #FFFFFF;
      border-right: 1px solid #E5E7EB;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      padding: 24px 16px;
      flex-shrink: 0;
    }}
    .doc-sidebar h2 {{
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #E5E7EB;
    }}
    .toc-nav {{ display: flex; flex-direction: column; gap: 2px; }}
    .toc-link {{
      display: block;
      color: #4B5563;
      text-decoration: none;
      font-size: 13px;
      padding: 6px 10px;
      border-radius: 6px;
      transition: all 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
    .toc-link:hover {{ color: #0066FF; background: #EFF6FF; }}
    .toc-link.h2 {{ font-weight: 600; color: #1F2937; margin-top: 8px; background: #F9FAFB; }}
    .toc-link.h3 {{ padding-left: 20px; font-size: 12px; color: #6B7280; }}
    .doc-main {{ flex: 1; padding: 32px 48px; max-width: 1280px; overflow-x: hidden; }}
    .doc-card {{
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      padding: 36px 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      margin-bottom: 24px;
    }}
    .doc-top-bar {{ display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }}
    .doc-back-link {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #FFFFFF;
      border: 1px solid #D1D5DB;
      border-radius: 6px;
      color: #374151;
      text-decoration: none;
      font-weight: 500;
      font-size: 13px;
      transition: all 0.2s;
    }}
    .doc-back-link:hover {{ border-color: #0066FF; color: #0066FF; background: #EFF6FF; }}
    h1 {{ font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #0066FF; }}
    h2 {{ font-size: 18px; font-weight: 700; color: #111827; margin: 32px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #E5E7EB; }}
    h3 {{ font-size: 15px; font-weight: 600; color: #1F2937; margin: 24px 0 12px 0; }}
    p {{ margin-bottom: 12px; color: #374151; font-size: 14px; }}
    ul, ol {{ margin: 8px 0 16px 24px; color: #374151; }}
    li {{ margin-bottom: 6px; }}
    blockquote {{ background: #F0F7FF; border-left: 4px solid #0066FF; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; color: #1E40AF; font-size: 13px; }}
    code {{ background: #F3F4F6; color: #EF4444; padding: 2px 6px; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; }}
    .table-wrap {{ overflow-x: auto; margin: 16px 0 24px 0; border: 1px solid #E5E7EB; border-radius: 8px; }}
    table {{ width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }}
    th {{ background: #F9FAFB; color: #374151; font-weight: 600; padding: 10px 14px; border-bottom: 1px solid #E5E7EB; white-space: nowrap; }}
    td {{ padding: 10px 14px; border-bottom: 1px solid #F3F4F6; color: #4B5563; vertical-align: middle; }}
    tr:last-child td {{ border-bottom: none; }}
    tr:hover td {{ background: #F9FAFB; }}
    hr {{ border: none; border-top: 1px solid #E5E7EB; margin: 32px 0; }}
  </style>
</head>
<body>

<div class="doc-layout">
  <aside class="doc-sidebar">
    <h2>📖 目录导航</h2>
    <nav class="toc-nav">
      {toc_html}
    </nav>
  </aside>

  <main class="doc-main">
    <div class="doc-top-bar">
      <a href="../index.html" class="doc-back-link">← 返回外呼系统首页</a>
      <span style="color:#6B7280; font-size:13px;">文档基线版本：2026.08.20 对齐版</span>
    </div>

    <div class="doc-card">
      {content_html}
    </div>
  </main>
</div>
<script src="../js/delivery-nav.js"></script>
</body>
</html>
"""
    return template

def build_outputs():
    md_text = MD_PATH.read_text(encoding='utf-8')

    toc, content_html = parse_markdown_to_html(md_text)
    doc_content = generate_doc_html(toc, content_html)
    return {
        DOC_HTML_PATH: doc_content,
    }


def main():
    parser = argparse.ArgumentParser(
        description='从唯一 Markdown 内容源生成并校验完整版说明文档。'
    )
    parser.add_argument(
        '--check',
        action='store_true',
        help='仅校验生成结果是否与 Markdown 同步，不写入文件。',
    )
    args = parser.parse_args()

    outputs = build_outputs()
    if args.check:
        stale_paths = [
            path.relative_to(ROOT_DIR)
            for path, expected in outputs.items()
            if not path.exists() or path.read_text(encoding='utf-8') != expected
        ]
        if stale_paths:
            for path in stale_paths:
                print(f'OUT OF SYNC: {path}', file=sys.stderr)
            return 1
        print('Documentation sync check PASS')
        return 0

    for path, content in outputs.items():
        path.write_text(content, encoding='utf-8')
        print(f'Successfully generated {path.relative_to(ROOT_DIR)}')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
