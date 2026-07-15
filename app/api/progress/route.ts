import { NextResponse } from "next/server";

let progress = {
  book: "Genesis",
  chapter: 1,
  preview: [
    "In the beginning God created heaven and earth.",
    "And the earth was void and empty, and darkness was upon the face of the deep.",
    "And God said: Be light made. And light was made.",
    "And God saw the light that it was good: and he divided the light from the darkness.",
    "And he called the light Day, and the darkness Night; and there was evening and morning one day.",
  ],
};

export async function GET() {
  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const body = await request.json();

  progress = {
    book: body.book,
    chapter: body.chapter,
    preview: body.preview,
  };

  return NextResponse.json({ ok: true });
}