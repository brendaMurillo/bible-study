"use client";

import { useEffect, useState } from "react";
import "./globals.css";

const bible = [
  {
    book: "John",
    chapter: 6,
    verses: [
      "After these things Jesus went over the sea of Galilee, which is that of Tiberias.",
      "And a great multitude followed him, because they saw the miracles which he did on them that were diseased.",
      "Jesus therefore went up into a mountain, and there he sat with his disciples.",
      "Now the pasch, the festival day of the Jews, was near at hand.",
      "When Jesus therefore had lifted up his eyes, and seen that a very great multitude cometh to him, he said to Philip: Whence shall we buy bread, that these may eat?",
    ],
  },
  {
    book: "John",
    chapter: 7,
    verses: [
      "After these things Jesus walked in Galilee; for he would not walk in Judea, because the Jews sought to kill him.",
      "Now the Jews' feast of tabernacles was at hand.",
      "And his brethren said to him: Pass from hence, and go into Judea.",
    ],
  },
];

export default function Home() {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [summary, setSummary] = useState("");

  const chapter = bible[chapterIndex];

  useEffect(() => {
    const savedIndex = localStorage.getItem("lastChapterIndex");
    const savedSummary = localStorage.getItem("chapterSummary");
    const savedFavorites = localStorage.getItem("favorites");

    if (savedIndex) setChapterIndex(Number(savedIndex));
    if (savedSummary) setSummary(savedSummary);
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  useEffect(() => {
    localStorage.setItem("lastChapterIndex", String(chapterIndex));
  }, [chapterIndex]);

  function addFavorite(verse: string) {
    const quote = `${chapter.book} ${chapter.chapter} — ${verse}`;
    const updated = [...favorites, quote];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  }

  function saveSummary(value: string) {
    setSummary(value);
    localStorage.setItem("chapterSummary", value);
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
              setChapterIndex(Math.min(bible.length - 1, chapterIndex + 1))
            }
            className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-purple-950"
          >
            Next Chapter
          </button>
        </div>

<article className="max-h-[65vh] overflow-y-auto rounded-3xl bg-[#fff7df] p-6 text-[#28122f] shadow-xl">          {chapter.verses.map((verse, index) => (
            <p
              key={index}
              onClick={() => addFavorite(verse)}
              className="mb-5 cursor-pointer text-lg leading-8"
            >
              <span className="mr-2 font-bold text-purple-900">{index + 1}</span>
              {verse}
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