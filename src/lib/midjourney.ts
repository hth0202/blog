export interface MidjourneyMeta {
  model: string;
  srefs: { value: string; weight?: string }[];
  profiles: string[];
  ratio: string;
  stylize: string;
}

export function parseMidjourneyPrompt(prompt: string): MidjourneyMeta {
  const flags = new Map(
    [
      ...prompt.matchAll(
        /(?:^|\s)--([a-z]+)\s+([\s\S]*?)(?=\s+--[a-z]+(?:\s+|$)|$)/gi,
      ),
    ].map(([, key, value]) => [key.toLowerCase(), value.trim()]),
  );

  return {
    model: flags.has('niji')
      ? `Niji ${flags.get('niji')}`
      : flags.has('v')
        ? `Midjourney ${flags.get('v') ?? '8.2'}`
        : 'Midjourney 8.2',
    srefs: (flags.get('sref') ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .map((value) => {
        const match = value.match(/^(.*?)(?:::([\d.]+))?$/);
        return { value: match?.[1] ?? value, weight: match?.[2] };
      }),
    profiles: (flags.get('profile') ?? '').split(/\s+/).filter(Boolean),
    ratio: flags.get('ar') ?? '',
    stylize: flags.get('stylize') ?? flags.get('s') ?? '',
  };
}
