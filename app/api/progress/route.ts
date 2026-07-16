import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

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

function getKey(deviceId: string | null) {
  return `bible-progress-${deviceId || "default"}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");

  const progress = await kv.get(getKey(deviceId));
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

  await kv.set(getKey(body.deviceId || "default"), progress);

  return NextResponse.json({ ok: true });
}