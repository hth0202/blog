import Image from 'next/image';

const SIDES = [
  {
    logo: '/side/depart.png',
    name: '프로젝트명',
    desc: '프로젝트 설명',
    period: '0000.00~0000.00',
  },
  {
    logo: '/side/word.png',
    name: '프로젝트명',
    desc: '프로젝트 설명',
    period: '0000.00~0000.00',
  },
];

export function SideSection() {
  return (
    <div className="mt-8 mb-4 grid grid-cols-1 gap-10 sm:grid-cols-2">
      {SIDES.map((s, i) => (
        <div key={i} className="flex items-start gap-6">
          <div className="shrink-0">
            <Image
              src={s.logo}
              alt={s.name}
              width={100}
              height={100}
              className="rounded-xl object-contain"
            />
          </div>
          <div className="pt-1">
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {s.name}
            </p>
            <p className="text-gray-700 dark:text-gray-300">{s.desc}</p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              {s.period}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
