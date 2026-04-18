import Image from 'next/image';

const SCHOOLS = [
  {
    logo: '/school/cufs.png',
    name: '사이버한국외국어대학교',
    degree: '한국어학부 한국어교육전공 학사 / 중국어학부 학사',
    period: '2022.03~2024.08',
  },
  {
    logo: '/school/jangan.png',
    name: '장안대학교',
    degree: '관광비즈니스중국어 전문학사',
    period: '2017.03~2019.02',
    nobg: true,
  },
  {
    logo: '/school/youngsang.png',
    name: '서울영상고등학교',
    degree: '영상콘텐츠과 졸업',
    period: '2013.03~2016.02',
    nobg: true,
  },
];

export function EducationSection() {
  return (
    <div className="mt-8 mb-4 space-y-10 pl-4">
      {SCHOOLS.map((s) => (
        <div key={s.name} className="flex items-start gap-8">
          <div className="shrink-0">
            <Image
              src={s.logo}
              alt={s.name}
              width={100}
              height={100}
              className={`rounded-full object-contain${s.nobg ? 'mix-blend-multiply dark:mix-blend-normal' : ''}`}
            />
          </div>
          <div className="pt-1">
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {s.name}
            </p>
            <p className="text-gray-700 dark:text-gray-300">{s.degree}</p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              {s.period}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
