from pathlib import Path
import zipfile
root = Path(__file__).resolve().parents[1]
assets = root / "app/src/main/assets"
out = root.parent / "empilha-output"
out.mkdir(exist_ok=True)
html = (assets / "index.html").read_text(encoding="utf-8")
html = html.replace('<link rel="stylesheet" href="style.css">', "<style>" + (assets / "style.css").read_text(encoding="utf-8") + "</style>")
for script in ("core.js", "game.js"):
    html = html.replace('<script src="' + script + '"></script>', "<script>" + (assets / script).read_text(encoding="utf-8") + "</script>")
assert 'src="core.js"' not in html and 'href="style.css"' not in html
(out / "Empilha_Turbo_TESTE.html").write_text(html, encoding="utf-8")
with zipfile.ZipFile(out / "Empilha_Turbo_Fonte.zip", "w", zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(root.rglob("*")):
        relative = path.relative_to(root)
        if path.is_file() and not any(part in (".gradle", "build", ".git") for part in relative.parts) and path.name != "local.properties":
            archive.write(path, Path("Empilha_Turbo") / relative)
print("Portable HTML and source archive generated.")
