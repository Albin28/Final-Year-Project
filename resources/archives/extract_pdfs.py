"""
PDF Text Extractor Utility
--------------------------
Scans the entire Final-Year-Project folder (recursively) for PDF files.
For each PDF found, extracts all text and saves it as a .txt file
in the same directory as the PDF.

Skips PDFs that already have a corresponding .txt file (unless --force is used).

Usage:
    python extract_pdfs.py              # Extract new PDFs only
    python extract_pdfs.py --force      # Re-extract all PDFs
    python extract_pdfs.py --dir <path> # Scan a specific directory
"""

import fitz  # PyMuPDF
import os
import sys
import argparse


def extract_pdf_to_txt(pdf_path, output_path):
    """Extract all text from a PDF and write to a .txt file."""
    doc = fitz.open(pdf_path)
    text = ""
    for page_num, page in enumerate(doc):
        text += f"\n{'='*80}\nPAGE {page_num + 1}\n{'='*80}\n"
        text += page.get_text()
    doc.close()

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)

    return len(text)


def get_txt_path(pdf_path):
    """Generate the output .txt path for a given PDF."""
    base = os.path.splitext(pdf_path)[0]
    # Clean up the name: replace spaces/special chars with underscores
    dirname = os.path.dirname(pdf_path)
    filename = os.path.splitext(os.path.basename(pdf_path))[0]
    safe_name = filename.replace(" ", "_").replace("-", "_").lower()
    return os.path.join(dirname, f"{safe_name}_text.txt")


def scan_and_extract(root_dir, force=False):
    """Walk through root_dir, find PDFs, and extract text."""
    extracted = 0
    skipped = 0
    errors = 0

    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if not filename.lower().endswith(".pdf"):
                continue

            pdf_path = os.path.join(dirpath, filename)
            txt_path = get_txt_path(pdf_path)

            # Skip if .txt already exists (unless forced)
            if os.path.exists(txt_path) and not force:
                print(f"  SKIP  {pdf_path}  (txt already exists)")
                skipped += 1
                continue

            try:
                char_count = extract_pdf_to_txt(pdf_path, txt_path)
                print(f"  OK    {pdf_path}  -> {os.path.basename(txt_path)} ({char_count} chars)")
                extracted += 1
            except Exception as e:
                print(f"  ERR   {pdf_path}  -> {e}")
                errors += 1

    print(f"\n{'='*50}")
    print(f"Done! Extracted: {extracted} | Skipped: {skipped} | Errors: {errors}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract text from PDFs in the project folder.")
    parser.add_argument("--force", action="store_true", help="Re-extract even if .txt already exists")
    parser.add_argument("--dir", type=str, default=r"c:\Projects\Final-Year-Project",
                        help="Root directory to scan (default: project root)")
    args = parser.parse_args()

    print(f"Scanning: {args.dir}")
    print(f"Mode: {'Force re-extract' if args.force else 'New PDFs only'}\n")

    scan_and_extract(args.dir, force=args.force)
