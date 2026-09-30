export interface MidjourneyMeta {
  model: string;
  srefs: { value: string; weight?: string }[];
  profiles: string[];
  // 한 프롬프트의 sref + 프로필 코드 묶음. 코드가 2개 이상일 때만 있다
  combo: { label: string; key: string } | null;
  ratio: string;
  stylize: string;
}

// 끝 쉼표를 떼고 이미지 링크를 뺀 뒤, 가중치를 뗀 코드 기준으로 처음 것만 남긴다
const cleanCodes = (values: string[]) => {
  const seen = new Set<string>();
  return values
    .map((value) => value.replace(/,+$/, ''))
    .filter((value) => value && !value.includes('://'))
    .filter((value) => {
      const code = value.split('::')[0].toLowerCase();
      if (seen.has(code)) return false;
      seen.add(code);
      return true;
    });
};

export function parseMidjourneyPrompt(prompt: string): MidjourneyMeta {
  // `--이름` 뒤부터 다음 `--` 전까지가 그 옵션의 값
  const options: { key: string; values: string[] }[] = [];
  for (const token of prompt.split(/\s+/)) {
    if (/^--[a-z]+$/i.test(token)) {
      options.push({ key: token.slice(2).toLowerCase(), values: [] });
    } else if (token) {
      options.at(-1)?.values.push(token);
    }
  }
  const valuesOf = (...keys: string[]) =>
    options
      .filter((option) => keys.includes(option.key))
      .flatMap((option) => option.values);
  // 값이 하나인 옵션은 값이 있는 마지막 것을 쓴다
  const valueOf = (key: string) =>
    options
      .findLast((option) => option.key === key && option.values.length)
      ?.values.join(' ');

  const srefCodes = cleanCodes(valuesOf('sref'));
  const profiles = cleanCodes(valuesOf('profile', 'p'));
  const niji = valueOf('niji');

  const combo =
    srefCodes.length + profiles.length >= 2
      ? {
          label: [
            profiles.length ? `--profile ${profiles.join(' ')}` : '',
            srefCodes.length ? `--sref ${srefCodes.join(' ')}` : '',
          ]
            .filter(Boolean)
            .join(' '),
          key: [profiles, srefCodes]
            .map((codes) =>
              codes
                .map((code) => code.toLowerCase())
                .sort()
                .join(' '),
            )
            .join(' | '),
        }
      : null;

  return {
    model: niji ? `Niji ${niji}` : `Midjourney ${valueOf('v') ?? '8.2'}`,
    srefs: srefCodes.map((code) => {
      const [value, weight] = code.split('::');
      return { value, weight: weight || undefined };
    }),
    profiles,
    combo,
    ratio: valueOf('ar') ?? '',
    stylize: valueOf('stylize') ?? valueOf('s') ?? '',
  };
}
