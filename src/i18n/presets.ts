import type { Lang } from '@/types';

type PresetText = { name: string; description: string };

/**
 * Display text for built-in presets, keyed by preset id; English lives in
 * `defaultPresets.ts` as the fallback, so a missing entry can never break a preset.
 */
export const PRESET_TEXT: Record<Lang, Record<string, PresetText>> = {
  en: {},
  vi: {
    flat: { name: 'Phẳng', description: 'Phản hồi tham chiếu — không tô màu, mọi dải ở 0 dB.' },
    'bass-boost': {
      name: 'Tăng bass',
      description: 'Nâng dải thấp 31–250 Hz mượt, giảm dần về vùng cao.',
    },
    'deep-bass': {
      name: 'Bass sâu',
      description: 'Tập trung sub-bass: dồn 31–125 Hz mạnh, cắt nhẹ vùng trung.',
    },
    'treble-boost': { name: 'Tăng treble', description: 'Sáng và rộng: tăng mượt từ 2 kHz trở lên.' },
    'vocal-boost': {
      name: 'Tăng giọng hát',
      description: 'Nổi giọng 500 Hz–4 kHz, đồng thời giảm rung và tiếng xé.',
    },
    podcast: { name: 'Podcast', description: 'Ưu tiên giọng nói: cắt rung, nâng vùng hiện diện 1–4 kHz.' },
    'speech-clarity': {
      name: 'Giọng rõ',
      description: 'Cắt bùn mạnh cho lời thoại và thuyết minh khó nghe.',
    },
    pop: { name: 'Pop', description: 'Pop chuẩn radio: bass chắc, hi-hat và giọng sáng.' },
    rock: { name: 'Rock', description: 'Rock mạnh kiểu cổ điển: đáy dày, 4–8 kHz gắt.' },
    edm: { name: 'EDM', description: 'Nhạc điện tử: sub-bass dồn, trung lõm, đỉnh sáng.' },
    'hip-hop': { name: 'Hip-Hop', description: 'Nhấn kick và 808, phần trên ấm và rộng.' },
    classical: {
      name: 'Cổ điển',
      description: 'Gần trung tính, thêm một chút không khí — cân bằng và tự nhiên.',
    },
    jazz: {
      name: 'Jazz',
      description: 'Ấm ở dưới, mở ở giữa: chỗ cho bass upright, chổi và kèn.',
    },
    acoustic: {
      name: 'Acoustic',
      description: 'Dàn dây và ngón tay: tiết chế cộng hưởng thấp, nâng chi tiết.',
    },
    gaming: {
      name: 'Gaming',
      description: 'Ưu tiên chi tiết cho tiếng bước chân, hiệu ứng và giao diện (không phải âm thanh vòm).',
    },
    movie: { name: 'Phim', description: 'Không khí điện ảnh: bass sâu hơn và lời thoại nổi hơn.' },
    'night-mode': {
      name: 'Chế độ đêm',
      description: 'Nghe âm lượng nhỏ: bớt bass ì và cao gắt, nâng lời thoại.',
    },
    loudness: {
      name: 'Loudness',
      description: 'Đường cong Fletcher–Munson cho nghe ở âm lượng nhỏ.',
    },
    bright: { name: 'Sáng', description: 'Mở và trong: nâng nhẹ 1–16 kHz, vùng thấp êm.' },
    warm: { name: 'Ấm', description: 'Sự ấm analog: thân 60–250 Hz, làm mềm 4–16 kHz.' },
    relax: { name: 'Thư giãn', description: 'Nghe dễ chịu: lõm trung nhẹ, đỉnh mềm, bass êm.' },
  },
};

/**
 * Category labels for built-in presets (and the default custom/imported
 * categories). English categories are already English, so only VI is filled in;
 * anything unknown falls back to the raw stored string.
 */
export const CATEGORY_TEXT: Record<Lang, Record<string, string>> = {
  en: {},
  vi: {
    Neutral: 'Trung tính',
    Bass: 'Tiếng bass',
    Treble: 'Tiếng treble',
    Vocal: 'Giọng hát',
    Speech: 'Lời thoại',
    Music: 'Âm nhạc',
    Gaming: 'Trò chơi',
    Cinema: 'Điện ảnh',
    Utility: 'Tiện ích',
    Custom: 'Tuỳ chỉnh',
    Imported: 'Đã nhập',
  },
};
