import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const KEY = "brenda-bible-progress";

const fallback = {
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
  const progress = await kv.get(KEY);
  return NextResponse.json(progress || fallback);
}

export async function POST(request: Request) {
  const body = await request.json();

  const progress = {
    book: body.book,
    chapter: body.chapter,
    chapterIndex: body.chapterIndex,
    preview: body.preview,
    updatedAt: new Date().toISOString(),
  };

  await kv.set(KEY, progress);

  return NextResponse.json({ ok: true });
}