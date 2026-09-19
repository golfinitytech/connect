import argparse
import mimetypes
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str | None = None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def send_head(self):
        parsed = urlparse(self.path)
        path = parsed.path or "/"
        if path.endswith("/"):
            path = f"{path}index.html"

        accept_encoding = self.headers.get("Accept-Encoding", "")
        should_gzip = "gzip" in accept_encoding

        if should_gzip and (path.endswith(".js") or path.endswith(".css") or path.endswith(".json") or path.endswith(".html")):
            translated = Path(self.translate_path(path))
            gz_path = translated.with_name(f"{translated.name}.gz")

            if gz_path.is_file():
                ctype = mimetypes.guess_type(str(translated))[0] or "application/octet-stream"
                try:
                    f = open(gz_path, "rb")
                except OSError:
                    return super().send_head()

                fs = os.fstat(f.fileno())
                self.send_response(200)
                self.send_header("Content-type", ctype)
                self.send_header("Content-Encoding", "gzip")
                self.send_header("Vary", "Accept-Encoding")
                self.send_header("Content-Length", str(fs.st_size))
                self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
                self.end_headers()
                return f

        return super().send_head()

    def end_headers(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path or "/"

        if path == "/" or path == "/index.html":
            self.send_header("Cache-Control", "no-store, max-age=0, must-revalidate")
        elif path.startswith("/_expo/static/js/") or path.startswith("/_expo/static/css/") or path.startswith("/assets/"):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        else:
            self.send_header("Cache-Control", "no-cache")

        super().end_headers()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8084)
    parser.add_argument("--dir", default=str(Path(__file__).resolve().parents[1] / "dist"))
    args = parser.parse_args()

    directory = str(Path(args.dir).resolve())
    httpd = ThreadingHTTPServer((args.host, args.port), lambda *a, **k: Handler(*a, directory=directory, **k))
    httpd.serve_forever()


if __name__ == "__main__":
    main()
