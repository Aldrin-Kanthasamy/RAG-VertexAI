from app.utils.document_parsers import ALLOWED_EXTENSIONS, EXTENSION_TO_CONTENT_TYPE, parse_text


def test_parse_text():
    content = b"Hello, this is a test document."
    result = parse_text(content)
    assert result == "Hello, this is a test document."


def test_parse_text_utf8():
    content = "Unicode: \u00e9\u00e0\u00fc\u00f1".encode("utf-8")
    result = parse_text(content)
    assert "\u00e9" in result


def test_allowed_extensions():
    assert ".pdf" in ALLOWED_EXTENSIONS
    assert ".docx" in ALLOWED_EXTENSIONS
    assert ".txt" in ALLOWED_EXTENSIONS
    assert ".md" in ALLOWED_EXTENSIONS
    assert ".exe" not in ALLOWED_EXTENSIONS


def test_extension_to_content_type():
    assert EXTENSION_TO_CONTENT_TYPE[".pdf"] == "application/pdf"
    assert EXTENSION_TO_CONTENT_TYPE[".txt"] == "text/plain"
