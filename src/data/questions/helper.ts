import { Difficulty, Question, WorldId } from '../../types/game';

export type RawQ = [
  difficulty: Difficulty,
  question: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
  hint: string
];

export function buildWorldQuestions(worldId: WorldId, prefix: string, rows: RawQ[]): Question[] {
  return rows.map(([difficulty, question, options, correctIndex, explanation, hint], idx) => ({
    id: `${prefix}-${String(idx + 1).padStart(3, '0')}`,
    category: worldId,
    difficulty,
    question,
    options,
    correctIndex,
    explanation,
    hint,
  }));
}
