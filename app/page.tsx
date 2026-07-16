"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type Favorite = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  chapterIndex: number;
};

export default function Home() {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [summary, setSummary] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Favorite[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [readingMode, setReadingMode] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const chapter = chapters[chapterIndex];

  const books = useMemo(() => Object.keys(data), []);
  const chaptersForBook = useMemo(
    () => chapters.filter((c) => c.book === chapter.book),
    [chapter.book]
  );

  async function saveProgressForWidget() {
  const preview = chapter.verses.slice(0, 5).map((verse) => verse.text);

  const params = new URLSearchParams(window.location.search);
  const deviceId = params.get("deviceId") || "default";

  await fetch("/api/progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deviceId,
      book: chapter.book,
      chapter: chapter.chapter,
      chapterIndex,
      preview,
    }),
  });
}

  useEffect(() => {
    const savedIndex = localStorage.getItem("lastChapterIndex");
    const savedFavorites = localStorage.getItem("favorites");
    const savedHighlights = localStorage.getItem("highlights");

    if (savedIndex) setChapterIndex(Number(savedIndex));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHighlights) setHighlights(JSON.parse(savedHighlights));
  }, []);

  useEffect(() => {
  localStorage.setItem("lastChapterIndex", String(chapterIndex));
  setSummary(
    localStorage.getItem(`summary-${chapter.book}-${chapter.chapter}`) || ""
  );

  saveProgressForWidget();
}, [chapterIndex, chapter.book, chapter.chapter]);

  function goToChapter(index: number) {
    setChapterIndex(Math.max(0, Math.min(chapters.length - 1, index)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectBook(book: string) {
    const index = chapters.findIndex((c) => c.book === book);
    if (index !== -1) goToChapter(index);
  }

  function selectChapter(chapterNumber: number) {
    const index = chapters.findIndex(
      (c) => c.book === chapter.book && c.chapter === chapterNumber
    );
    if (index !== -1) goToChapter(index);
  }

  function verseId(verseNumber: number) {
    return `${chapter.book}-${chapter.chapter}-${verseNumber}`;
  }

  function addFavorite(verseNumber: number, text: string) {
    const id = verseId(verseNumber);
    if (favorites.some((fav) => fav.id === id)) return;

    const updated = [
      ...favorites,
      {
        id,
        book: chapter.book,
        chapter: chapter.chapter,
        verse: verseNumber,
        text,
        chapterIndex,
      },
    ];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  }

  function removeFavorite(id: string) {
    const updated = favorites.filter((fav) => fav.id !== id);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  }

  function toggleHighlight(verseNumber: number) {
    const id = verseId(verseNumber);
    const updated = highlights.includes(id)
      ? highlights.filter((item) => item !== id)
      : [...highlights, id];

    setHighlights(updated);
    localStorage.setItem("highlights", JSON.stringify(updated));
  }

  function saveSummary(value: string) {
    setSummary(value);
    localStorage.setItem(`summary-${chapter.book}-${chapter.chapter}`, value);
  }

  function searchBible(query: string) {
    setSearchQuery(query);

    const words = query
      .toLowerCase()
      .split(" ")
      .filter((word) => word.length > 2);

    if (words.length === 0) {
      setSearchResults([]);
      return;
    }

    const results = chapters.flatMap((chapterItem, index) =>
      chapterItem.verses
        .filter((verse) => {
          const text = verse.text.toLowerCase();
          return words.some((word) => text.includes(word));
        })
        .map((verse) => ({
          id: `${chapterItem.book}-${chapterItem.chapter}-${verse.number}`,
          book: chapterItem.book,
          chapter: chapterItem.chapter,
          verse: verse.number,
          text: verse.text,
          chapterIndex: index,
        }))
    );

    setSearchResults(results.slice(0, 10));
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const difference = touchStartX.current - touchEndX;

    if (difference > 70) goToChapter(chapterIndex + 1);
    if (difference < -70) goToChapter(chapterIndex - 1);

    touchStartX.current = null;
  }

  return (
    <main
      className={`relative min-h-screen cathedral-bg text-[#f8ead0] ${
        readingMode ? "reading-mode" : ""
      }`}
    >
      <section className="mx-auto max-w-3xl px-5 py-6">
        {!readingMode && (
          <>
            <div className="stained-card mb-6 rounded-[2rem] p-6 shadow-2xl">
              <p className="tracking-title text-sm uppercase text-[#e7c96a]">
                Catholic Bible Reader
              </p>

              <h1 className="title-font mt-4 text-5xl font-bold text-[#fff3d4]">
                {chapter.book} {chapter.chapter}
              </h1>

              <p className="mt-2 text-sm text-[#f4ddb2]">
                Peace be with you. Continue where you left off.
              </p>
            </div>

            <section className="mb-5 grid grid-cols-2 gap-3">
              <select
                value={chapter.book}
                onChange={(e) => selectBook(e.target.value)}
                className="church-select"
              >
                {books.map((book) => (
                  <option key={book} value={book}>
                    {book}
                  </option>
                ))}
              </select>

              <select
                value={chapter.chapter}
                onChange={(e) => selectChapter(Number(e.target.value))}
                className="church-select"
              >
                {chaptersForBook.map((item) => (
                  <option key={item.chapter} value={item.chapter}>
                    Chapter {item.chapter}
                  </option>
                ))}
              </select>
            </section>

            <div className="mb-5 flex justify-between gap-3">
              <button
                onClick={() => goToChapter(chapterIndex - 1)}
                className="gold-button"
              >
                Previous
              </button>

              <button
                onClick={() => goToChapter(chapterIndex + 1)}
                className="gold-button"
              >
                Next Chapter
              </button>
            </div>

            <section className="mb-5 rounded-[2rem] border border-[#8c6a2f]/50 bg-[#1c130d]/90 p-5 shadow-xl">
              <h2 className="title-font mb-3 text-2xl font-bold text-[#f4ddb2]">
                Find Scripture
              </h2>

              <input
                value={searchQuery}
                onChange={(e) => searchBible(e.target.value)}
                placeholder='Describe or search, like: "love is patient"'
                className="w-full rounded-2xl border border-[#c9a64a]/40 bg-[#f4ead2] p-4 text-[#28170d] outline-none"
              />

              {searchResults.length > 0 && (
                <div className="mt-4 space-y-3">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        goToChapter(result.chapterIndex);
                        setSearchResults([]);
                        setSearchQuery("");
                      }}
                      className="block w-full rounded-2xl bg-[#f4ead2] p-4 text-left text-[#28170d]"
                    >
                      <p className="font-bold text-[#2d5b46]">
                        {result.book} {result.chapter}:{result.verse}
                      </p>
                      <p className="mt-1 text-sm leading-6">{result.text}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {readingMode && (
          <div className="mb-5 text-center">
            <p className="tracking-title text-xs uppercase text-[#d8b65a]">
              Catholic Bible Reader
            </p>

            <h1 className="title-font text-5xl text-[#fff3d4]">
              {chapter.book} {chapter.chapter}
            </h1>

            <div className="mx-auto mt-5 flex max-w-md justify-between gap-3">
              <button
                onClick={() => goToChapter(chapterIndex - 1)}
                className="gold-button"
              >
                Previous
              </button>

              <button
                onClick={() => goToChapter(chapterIndex + 1)}
                className="gold-button"
              >
                Next Chapter
              </button>
            </div>
          </div>
        )}

        <article
          className={`reader-card relative ${
            readingMode ? "reading-card" : "max-h-[62vh]"
          }`}
        >
          <button
            onClick={() => setReadingMode(!readingMode)}
            className="absolute right-4 top-4 z-10 rounded-full border border-[#d8b65a]/70 bg-black/35 px-2.5 py-1 text-[11px] font-bold text-[#fff3d4] backdrop-blur"
          >
            {readingMode ? "Exit Reading Mode" : "Reading Mode ⛶"}
          </button>

          {chapter.verses.map((verse) => {
            const id = verseId(verse.number);
            const isHighlighted = highlights.includes(id);

            return (
              <div
                key={verse.number}
                className={`verse-block ${isHighlighted ? "highlighted" : ""}`}
              >
                <div className="flex gap-3">
                  {!readingMode && (
                    <div className="flex min-w-8 flex-col items-center gap-2 pt-1">
                      <button
                        onClick={() => addFavorite(verse.number, verse.text)}
                        title="Favorite"
                        className="verse-action"
                      >
                        ♡
                      </button>

                      <button
                        onClick={() => toggleHighlight(verse.number)}
                        title="Highlight"
                        className="verse-action gold"
                      >
                        ✦
                      </button>
                    </div>
                  )}

                  <p className="text-xl leading-9">
                    <span className="verse-number">{verse.number}</span>
                    {verse.text}
                  </p>
                </div>
              </div>
            );
          })}
        </article>

        {!readingMode && (
          <>
            <section className="mt-6 rounded-[2rem] border border-[#8c6a2f]/50 bg-[#1c130d]/90 p-5">
              <h2 className="title-font mb-3 text-2xl font-bold">
                Reflection / Notes
              </h2>

              <textarea
                value={summary}
                onChange={(e) => saveSummary(e.target.value)}
                placeholder="Write your summary, prayer, or reflection here..."
                className="min-h-32 w-full rounded-2xl border border-[#c9a64a]/40 bg-[#f4ead2] p-4 text-[#28170d] outline-none"
              />
            </section>

            <section className="mt-6 rounded-[2rem] border border-[#8c6a2f]/50 bg-[#1c130d]/90 p-5">
              <h2 className="title-font mb-3 text-2xl font-bold">
                Favorite Quotes
              </h2>

              {favorites.length === 0 ? (
                <p className="text-[#f4ddb2]">Save verses with ♡.</p>
              ) : (
                <div className="space-y-3">
                  {favorites.map((fav, index) => (
                    <div
                      key={`${fav.id}-${index}`}
                      className="rounded-2xl bg-[#f4ead2] p-4 text-[#28170d]"
                    >
                      <button
                        onClick={() => goToChapter(fav.chapterIndex)}
                        className="block text-left"
                      >
                        <p className="font-bold text-[#2d5b46]">
                          {fav.book} {fav.chapter}:{fav.verse}
                        </p>
                        <p className="mt-1 text-sm leading-6">{fav.text}</p>
                      </button>

                      <button
                        onClick={() => removeFavorite(fav.id)}
                        className="mt-3 rounded-full bg-[#2d5b46] px-3 py-1 text-xs font-bold text-[#fff3d4]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}