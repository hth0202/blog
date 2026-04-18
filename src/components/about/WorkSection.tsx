import Image from 'next/image';

const WORKS = [
  {
    logo: '/work/zep.png',
    name: 'ZEP',
    role: '직책',
    period: '0000.00~재직 중',
  },
  {
    logo: '/work/maeil.png',
    name: '회사명',
    role: '직책',
    period: '0000.00~0000.00',
  },
  {
    logo: '/work/allbus.png',
    name: '올버스',
    role: '직책',
    period: '0000.00~0000.00',
  },
];

export function WorkSection() {
  return (
    <div className="mt-8 mb-4 grid grid-cols-1 gap-10 sm:grid-cols-2">
      {WORKS.map((w) => (
        <div key={w.name} className="flex items-start gap-6">
          <div className="shrink-0">
            <Image
              src={w.logo}
              alt={w.name}
              width={120}
              height={50}
              className="rounded-lg object-contain"
            />
          </div>
          <div className="pt-1">
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {w.name}
            </p>
            <p className="text-gray-700 dark:text-gray-300">{w.role}</p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              {w.period}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
