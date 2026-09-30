// Notion 파일 URL에서 파일마다 고정된 ID를 꺼낸다 (presigned 쿼리는 매번 바뀜)
export function getNotionFileId(fileUrl: string): string | null {
  try {
    const id = new URL(fileUrl).pathname.split('/')[2];
    return id && /^[0-9a-f-]{36}$/i.test(id) ? id : null;
  } catch {
    return null;
  }
}
