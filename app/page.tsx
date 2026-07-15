"use client";

import { useEffect, useMemo, useState } from "react";
import "./globals.css";
import bibleData from "./data/douay-rheims.json";

type BibleData = Record<string, Record<string, Record<string, string>>>;

const data = bibleData as BibleData;

const chapters = Object.entries(data).flatMap(([book, chapterObj]) =>
  Object.entries(chapterObj).map(([chapter, versesObj]) => ({
    book,
    chapter: Number(chapter),
    verses: Object.entries(versesObj).map(([verseNumber, text]) => ({
      number: Number(verseNumber),
      text: text.replaceAll("*", ""),
    })),
  }))
);

export default function Home() {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [summary, setSummary] = useState("");

  const chapter = chapters[chapterIndex];

  useEffect(() => {
    const savedIndex = localStorage.getItem("lastChapterIndex");
    const savedFavorites = localStorage.getItem("favorites");

    if (savedIndex) setChapterIndex(Number(savedIndex));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  useEffect(() => {
    localStorage.setItem("lastChapterIndex", String(chapterIndex));
    setSummary(localStorage.getItem(`summary-${chapter.book}-${chapter.chapter}`) || "");
  }, [chapterIndex, chapter.book, chapter.chapter]);

  function addFavorite(verseNumber: number, verse: string) {
    const quote = `${chapter.book} ${chapter.chapter}:${verseNumber} — ${verse}`;
    if (favorites.includes(quote)) return;

    const updated = [...favorites, quote];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  }

  function saveSummary(value: string) {
    setSummary(value);
    localStorage.setItem(`summary-${chapter.book}-${chapter.chapter}`, value);
  }

  return (
    <main className="min-h-screen bg-[#160b1f] text-[#fff7df]">
      <section className="mx-auto max-w-3xl px-5 py-6">
        <div className="stained-card mb-6 rounded-3xl p-5 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-yellow-200">
            Catholic Bible Reader
          </p>
          <h1 className="mt-3 text-4xl font-bold">
            {chapter.book} {chapter.chapter}
          </h1>
          <p className="mt-2 text-sm text-yellow-100">
            Continue where you left off.
          </p>
        </div>

        <div className="mb-5 flex justify-between gap-3">
          <button
            onClick={() => setChapterIndex(Math.max(0, chapterIndex - 1))}
            className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-purple-950"
          >
            Previous
          </button>

          <button
            onClick={() =>
              setChapterIndex(Math.min(chapters.length - 1, chapterIndex + 1))
            }
            className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-purple-950"
          >
            Next Chapter
          </button>
        </div>

        <article className="max-h-[62vh] overflow-y-auto rounded-3xl bg-[#fff7df] p-6 text-[#28122f] shadow-xl">
          {chapter.verses.map((verse) => (
            <p
              key={verse.number}
              onClick={() => addFavorite(verse.number, verse.text)}
              className="mb-5 cursor-pointer text-lg leading-8"
            >
              <span className="mr-2 font-bold text-purple-900">
                {verse.number}
              </span>
              {verse.text}
            </p>
          ))}
        </article>

        <section className="mt-6 rounded-3xl bg-[#2a1238] p-5">
          <h2 className="mb-3 text-xl font-bold">Chapter Summary / Notes</h2>
          <textarea
            value={summary}
            onChange={(e) => saveSummary(e.target.value)}
            placeholder="Write your summary or reflection here..."
            className="min-h-32 w-full rounded-2xl p-4 text-[#28122f]"
          />
        </section>

        <section className="mt-6 rounded-3xl bg-[#2a1238] p-5">
          <h2 className="mb-3 text-xl font-bold">Favorite Quotes</h2>
          {favorites.length === 0 ? (
            <p className="text-yellow-100">Tap a verse to save it here.</p>
          ) : (
            favorites.map((fav, index) => (
              <p key={index} className="mb-3 border-l-4 border-yellow-200 pl-3">
                {fav}
              </p>
            ))
          )}
        </section>
      </section>
    </main>
  );
}