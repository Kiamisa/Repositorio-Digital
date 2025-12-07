from fastapi import FastAPI, UploadFile, File
from docling.document_converter import DocumentConverter
import shutil
import os

app = FastAPI()
converter = DocumentConverter()

@app.post("/extract")
async def extract_text(file: UploadFile = File(...)):
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = converter.convert(temp_filename)
        markdown_text = result.document.export_to_markdown()
        return {"text": markdown_text}
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)