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

type SearchResult = Favorite;

export default function Home() {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [summary, setSummary] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);

  const touchStartX = useRef<number | null>(null);
  const chapter = chapters[chapterIndex];

  const books = useMemo(() => Object.keys(data), []);
  const chaptersForBook = useMemo(
    () => chapters.filter((c) => c.book === chapter.book),
    [chapter.book]
  );

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

        <section className="mb-5 grid grid-cols-2 gap-3">
          <select
            value={chapter.book}
            onChange={(e) => selectBook(e.target.value)}
            className="rounded-2xl bg-[#fff7df] p-3 font-bold text-[#28122f]"
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
            className="rounded-2xl bg-[#fff7df] p-3 font-bold text-[#28122f]"
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
            className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-purple-950"
          >
            Previous
          </button>

          <button
            onClick={() => goToChapter(chapterIndex + 1)}
            className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-purple-950"
          >
            Next Chapter
          </button>
        </div>

        <section className="mb-5 rounded-3xl bg-[#2a1238] p-5">
          <h2 className="mb-3 text-xl font-bold">Find a Verse</h2>

          <input
            value={searchQuery}
            onChange={(e) => searchBible(e.target.value)}
            placeholder="Search, like: love is patient"
            className="w-full rounded-2xl p-4 text-[#28122f]"
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
                  className="block w-full rounded-2xl bg-[#fff7df] p-4 text-left text-[#28122f]"
                >
                  <p className="font-bold text-purple-900">
                    {result.book} {result.chapter}:{result.verse}
                  </p>
                  <p className="mt-1 text-sm leading-6">{result.text}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        <article
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="max-h-[62vh] overflow-y-auto rounded-3xl bg-[#fff7df] p-6 text-[#28122f] shadow-xl"
        >
          {chapter.verses.map((verse) => {
            const id = verseId(verse.number);
            const isHighlighted = highlights.includes(id);

            return (
              <div
                key={verse.number}
                className={`mb-5 rounded-2xl p-3 ${
                  isHighlighted ? "bg-yellow-200" : ""
                }`}
              >
                <p className="text-lg leading-8">
                  <span className="mr-2 font-bold text-purple-900">
                    {verse.number}
                  </span>
                  {verse.text}
                </p>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => addFavorite(verse.number, verse.text)}
                    className="rounded-full bg-[#2a1238] px-3 py-1 text-xs font-bold text-yellow-100"
                  >
                    Favorite
                  </button>

                  <button
                    onClick={() => toggleHighlight(verse.number)}
                    className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-purple-950"
                  >
                    {isHighlighted ? "Remove Highlight" : "Highlight"}
                  </button>
                </div>
              </div>
            );
          })}
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
            <p className="text-yellow-100">Save verses here.</p>
          ) : (
            <div className="space-y-3">
              {favorites.map((fav, index) => (
                <div
                  key={`${fav.id}-${index}`}
                  className="rounded-2xl bg-[#fff7df] p-4 text-[#28122f]"
                >
                  <button
                    onClick={() => goToChapter(fav.chapterIndex)}
                    className="block text-left"
                  >
                    <p className="font-bold text-purple-900">
                      {fav.book} {fav.chapter}:{fav.verse}
                    </p>
                    <p className="mt-1 text-sm leading-6">{fav.text}</p>
                  </button>

                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="mt-3 rounded-full bg-[#2a1238] px-3 py-1 text-xs font-bold text-yellow-100"
                  >
                    Remove Favorite
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}