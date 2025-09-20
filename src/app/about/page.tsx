"use client";

import React from "react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Page Title - Consistent with other pages */}
      <div className="mb-12 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold">소개</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          태피스토리에 오신 것을 환영합니다.
        </p>
      </div>

      {/* Two-column Intro Section */}
      <section className="flex flex-col md:flex-row items-start gap-8 md:gap-12 mb-16">
        {/* Left: Thumbnail */}
        <div className="flex-shrink-0 w-full md:w-1/3">
          <img
            src="https://picsum.photos/seed/profile/400/400"
            alt="Profile"
            className="w-full h-auto rounded-lg object-cover shadow-md"
          />
        </div>

        {/* Right: Introduction Text */}
        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-4">
            안녕하세요! 서비스 기획자 겸 PM 태피입니다.
          </h2>
          <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <p>
              저는 사용자의 문제를 해결하고 더 나은 경험을 제공하는 것에 열정을
              가진 제품 전문가입니다. 기술과 디자인의 교차점에서 일하며,
              아이디어를 현실로 만드는 과정을 즐깁니다.
            </p>
            <p>
              이 블로그는 저의 성장 기록이자, 제가 배우고 경험한 것들을 공유하는
              공간입니다. 서비스 기획, 프로젝트 관리, UX/UI 디자인, 그리고
              때로는 개발에 대한 생각들을 나눕니다. 솔직한 고민과 인사이트를
              통해 함께 성장하고 싶습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Career and Contact Section */}
      <section className="prose dark:prose-invert max-w-none mx-auto">
        <h2 className="text-2xl font-bold mt-12 mb-4">경력</h2>
        <ul>
          <li>
            <strong>Product Manager</strong> at Company A (2022 - Present)
          </li>
          <li>
            <strong>UX/UI Designer</strong> at Company B (2020 - 2022)
          </li>
          <li>
            <strong>Service Planner</strong> at Company C (2018 - 2020)
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-12 mb-4">Contact</h2>
        <p>
          다양한 기회에 열려있습니다. 커피챗이나 협업 제안은 언제나 환영입니다.{" "}
          <br />
          아래 이메일로 연락 주세요:{" "}
          <a
            href="mailto:contact@tappy.story"
            className="text-violet-500 hover:underline"
          >
            contact@tappy.story
          </a>
        </p>
      </section>
    </div>
  );
}
