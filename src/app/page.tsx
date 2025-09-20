"use client";

import React, { useState, useEffect, useRef } from "react";
import PostCard, { PostCardSkeleton } from "../components/PostCard";
import { getPosts } from "../services/notion";
import { Post } from "../types";

export default function HomePage() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  const textRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const allPosts = await getPosts();
        setRecentPosts(allPosts.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch recent posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentPosts();
  }, []);

  useEffect(() => {
    const animationTriggerScroll = 450; // Animation completes over this scroll distance
    const initialDashOffset = 4000;
    const textEl = textRef.current;
    if (!textEl) return;

    // Set initial state
    textEl.style.strokeDashoffset = String(initialDashOffset);

    const handleScroll = () => {
      const scrollTop = window.scrollY;

      // Calculate raw progress (0 to 1)
      const rawProgress = Math.min(scrollTop / animationTriggerScroll, 1);

      // Apply a cubic ease-in function: starts slow, accelerates towards the end
      const easedProgress = Math.pow(rawProgress, 3);

      const newDashOffset =
        initialDashOffset - initialDashOffset * easedProgress;

      requestAnimationFrame(() => {
        if (textRef.current) {
          textRef.current.style.strokeDashoffset = String(newDashOffset);
        }
      });

      const isComplete = rawProgress >= 1;
      if (isComplete !== animationComplete) {
        setAnimationComplete(isComplete);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check in case of reload

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [animationComplete]);

  return (
    <div className="-mt-16">
      <section className="relative h-[1550px]">
        {/* Sticky container for the hero content */}
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 -left-24 w-72 h-72 md:w-96 md:h-96 bg-violet-200 dark:bg-violet-900/50 rounded-full filter blur-3xl opacity-40 animate-blob-1"></div>
            <div className="absolute top-0 -right-24 w-72 h-72 md:w-96 md:h-96 bg-indigo-200 dark:bg-indigo-900/50 rounded-full filter blur-3xl opacity-40 animate-blob-2"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 md:w-96 md:h-96 bg-fuchsia-200 dark:bg-fuchsia-900/50 rounded-full filter blur-3xl opacity-40 animate-blob-3"></div>
          </div>

          <div className="relative z-10 px-4">
            <div className="animate-fade-in" style={{ opacity: 1 }}>
              <svg
                viewBox="0 0 1200 300"
                className="w-full max-w-xl md:max-w-6xl mx-auto title-svg"
                aria-label="태피스토리"
              >
                <text
                  ref={textRef}
                  className={`title-stroke ${animationComplete ? "filled" : ""}`}
                  x="50%"
                  y="50%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                >
                  태피스토리
                </text>
              </svg>
            </div>
            <div
              className={animationComplete ? "animate-fade-in-up" : "opacity-0"}
            >
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                서비스 기획자 겸 PM 태피가 엮어가는 성장 기록
                <br />
                솔직한 고민과 인사이트를 나눕니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <div
        id="main-content"
        className="relative z-10 bg-white dark:bg-gray-900"
      >
        <div className="max-w-4xl mx-auto pt-16 px-4 sm:px-6 lg:px-8">
          <section>
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
              최근 게시한 글
            </h2>
            <div className="space-y-8">
              {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <PostCardSkeleton key={index} />
                  ))
                : recentPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
