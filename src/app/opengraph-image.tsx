import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import path from 'path';

export const alt = '태피스토리';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  const faviconPath = path.join(process.cwd(), 'public', 'android-chrome-512x512.png');
  const faviconBase64 = `data:image/png;base64,${readFileSync(faviconPath).toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1040 0%, #111111 60%, #1a1040 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 배경 블롭 */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(167,139,250,0.18)',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(167,139,250,0.12)',
            filter: 'blur(80px)',
          }}
        />

        {/* 파비콘 */}
        <img
          src={faviconBase64}
          width={120}
          height={120}
          style={{ marginBottom: 28, borderRadius: 24 }}
        />

        {/* 타이틀 */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: '#a78bfa',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          태피스토리
        </div>

        {/* 서브타이틀 */}
        <div
          style={{
            fontSize: 28,
            color: '#c4b0e5',
            letterSpacing: '-0.01em',
          }}
        >
          서비스 기획자 겸 PM 태피가 엮어가는 성장 기록
        </div>
      </div>
    ),
    { ...size },
  );
}
