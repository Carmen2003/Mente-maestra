import { CIENCIA_TECNOLOGIA_QUESTIONS } from './cienciaTecnologia';
import { CULTURA_GENERAL_QUESTIONS } from './culturaGeneral';
import { DEPORTES_QUESTIONS } from './deportes';
import { DESAFIO_MAESTRO_QUESTIONS } from './desafioMaestro';
import { ENTRETENIMIENTO_QUESTIONS } from './entretenimiento';
import { GEOGRAFIA_QUESTIONS } from './geografia';
import { HISTORIA_QUESTIONS } from './historia';
import { LITERATURA_QUESTIONS } from './literatura';
import { MATEMATICAS_QUESTIONS } from './matematicas';
import { NATURALEZA_QUESTIONS } from './naturaleza';
import { Question } from '../../types/game';

export const DEFAULT_QUESTIONS: Question[] = [
  ...CULTURA_GENERAL_QUESTIONS,
  ...CIENCIA_TECNOLOGIA_QUESTIONS,
  ...HISTORIA_QUESTIONS,
  ...GEOGRAFIA_QUESTIONS,
  ...DEPORTES_QUESTIONS,
  ...MATEMATICAS_QUESTIONS,
  ...NATURALEZA_QUESTIONS,
  ...ENTRETENIMIENTO_QUESTIONS,
  ...LITERATURA_QUESTIONS,
  ...DESAFIO_MAESTRO_QUESTIONS,
];
