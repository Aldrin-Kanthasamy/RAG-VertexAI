import io
import logging

import docx
import fitz
import pytesseract
from PIL import Image

logger = logging.getLogger(__name__)


def parse_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text = page.get_text()
            if text.strip():
                text_parts.append(text)
            else:
                # OCR fallback for scanned/image-based pages
                pix = page.get_pixmap(dpi=300)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                ocr_text = pytesseract.image_to_string(img)
                if ocr_text.strip():
                    text_parts.append(ocr_text)
                    logger.info(f"OCR extracted text from page {page.number + 1}")
    return "\n".join(text_parts)


def parse_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join(paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip())


def parse_text(file_bytes: bytes) -> str:
    return file_bytes.decode("utf-8", errors="replace")


PARSERS = {
    "application/pdf": parse_pdf,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": parse_docx,
    "text/plain": parse_text,
    "text/markdown": parse_text,
}

EXTENSION_TO_CONTENT_TYPE = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".md": "text/markdown",
}

ALLOWED_EXTENSIONS = set(EXTENSION_TO_CONTENT_TYPE.keys())


def parse_document(file_bytes: bytes, content_type: str) -> str:
    parser = PARSERS.get(content_type)
    if parser is None:
        raise ValueError(f"Unsupported content type: {content_type}")
    return parser(file_bytes)
