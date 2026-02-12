from app.utils.text_processing import chunk_text


def test_chunk_text_basic():
    text = "Hello world. " * 200  # ~2600 chars
    chunks = chunk_text(text)
    assert len(chunks) > 1
    for chunk in chunks:
        assert len(chunk) <= 1100  # chunk_size + some tolerance


def test_chunk_text_short():
    text = "Short text."
    chunks = chunk_text(text)
    assert len(chunks) == 1
    assert chunks[0] == "Short text."


def test_chunk_text_empty():
    text = ""
    chunks = chunk_text(text)
    assert len(chunks) == 0


def test_chunk_text_preserves_content():
    text = "Sentence one. Sentence two. Sentence three. " * 50
    chunks = chunk_text(text)
    combined = " ".join(chunks)
    # All original sentences should appear in the combined output
    assert "Sentence one" in combined
    assert "Sentence three" in combined
