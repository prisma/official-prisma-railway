"use client";

import { useState, useEffect } from "react";
import { Post } from "@/app/generated/prisma/client";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  const addPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const newPost = await res.json();
    setPosts([...posts, newPost]);
    setTitle("");
    setContent("");
  };

  const deletePost = async (id: number) => {
    await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
    setPosts(posts.filter((post) => post.id !== id));
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-3xl mb-8">NextJS + Prisma ORM + Prisma Postgres</h1>

      <form onSubmit={addPost} className="mb-8">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-neutral-900 p-3 border border-neutral-700 rounded mb-3"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          className="w-full bg-neutral-900 p-3 border border-neutral-700 rounded mb-3"
        />
        <button className="px-6 py-2 bg-blue-500 text-white rounded w-full hover:bg-blue-600 cursor-pointer">
          Post
        </button>
      </form>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <p>No posts yet. Create your first post above!</p>
          </div>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="group relative p-6 rounded-lg bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors duration-200 border border-neutral-800 hover:border-neutral-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {post.title}
                  </h3>
                  {post.content && (
                    <p className="text-neutral-300 text-sm leading-relaxed">
                      {post.content}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deletePost(post.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-neutral-400 hover:text-red-400 p-2 -mt-1 -mr-2"
                  aria-label="Delete post"
                  title="Delete post"
                >
                  X
                </button>
              </div>
            </article>
          ))
        )}
      </div>
      <p>{process.env.RAILWAY_PUBLIC_DOMAIN}</p>
    </div>
  );
}
