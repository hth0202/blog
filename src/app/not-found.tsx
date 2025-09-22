import Link from 'next/link';

import { QuestionMarkCircleIcon } from '@/constants';

export default function NotFound() {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-20 text-center">
      <QuestionMarkCircleIcon className="mb-6 h-24 w-24 text-indigo-400 dark:text-indigo-500" />
      <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white">
        404
      </h1>
      <h2 className="mt-4 mb-2 text-2xl font-bold text-gray-700 dark:text-gray-300">
        페이지를 찾을 수 없습니다.
      </h2>
      <p className="mb-8 max-w-sm text-gray-500 dark:text-gray-400">
        요청하신 페이지가 존재하지 않거나, 주소가 잘못되었습니다. 입력하신
        주소를 다시 한번 확인해주세요.
      </p>
      <Link
        href="/"
        className="rounded-md bg-indigo-600 px-8 py-3 font-semibold text-white transition-colors duration-300 hover:bg-indigo-700"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
