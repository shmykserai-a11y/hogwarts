import { create } from 'zustand'
import { withBasePath } from '@/lib/base-path'

// Base path for pensieve images
const IMG = withBasePath('/textures/journey/pensieve')

export interface PensievePair {
    id: string
    label: string              // "Astronomical Tower", etc.
    realUrl: string
    fakeUrl: string
}

// All 10 pairs
export const PENSIEVE_PAIRS: PensievePair[] = [
    { id: 'astronomy',   label: 'Astronomy Tower',       realUrl: `${IMG}/Астрономическая башня real.webp`,  fakeUrl: `${IMG}/Астрономическая башня fake.webp`  },
    { id: 'diary',       label: "Riddle's Diary",         realUrl: `${IMG}/Дневник Реддла real.webp`,        fakeUrl: `${IMG}/Дневник Реддла fake.webp`         },
    { id: 'mirror',      label: 'Mirror of Erised',       realUrl: `${IMG}/Зеркало желаний real.webp`,       fakeUrl: `${IMG}/Зеркало жений fake.webp`           },
    { id: 'dragon',      label: 'Dragon Task',            realUrl: `${IMG}/Испытание с драконом real.webp`,  fakeUrl: `${IMG}/Испытание с драконов fake.webp`   },
    { id: 'timeturner',  label: 'Time-Turner',            realUrl: `${IMG}/Маховик времени real.webp`,       fakeUrl: `${IMG}/Маховик времени fake.webp`        },
    { id: 'sword',       label: "Sword of Gryffindor",    realUrl: `${IMG}/Меч Гриффиндора real.webp`,       fakeUrl: `${IMG}/Меч Гриффиндора fake.webp`        },
    { id: 'bank',        label: 'Gringotts Escape',       realUrl: `${IMG}/Побег из Банка real.webp`,        fakeUrl: `${IMG}/Побег из Банка fake.webp`         },
    { id: 'elf',         label: 'Free Elf',               realUrl: `${IMG}/Свободный эльф real.webp`,        fakeUrl: `${IMG}/Свободный эльф fake.webp`         },
    { id: 'horcrux',     label: 'Horcrux Destroyed',      realUrl: `${IMG}/Уничтожение Крестража real.webp`, fakeUrl: `${IMG}/Уничтожение Крестража fake.webp`  },
    { id: 'flying',      label: 'First Flying Lesson',    realUrl: `${IMG}/Урок полетов real.webp`,          fakeUrl: `${IMG}/Урок полетов fake.webp`           },
]

export interface PensieveQuestion {
    pairId: string
    label: string
    imageUrl: string
    isReal: boolean   // what the shown image actually is
}

function buildQuestions(): PensieveQuestion[] {
    // For each pair, randomly choose real or fake
    return PENSIEVE_PAIRS.map(pair => {
        const showReal = Math.random() < 0.5
        return {
            pairId: pair.id,
            label: pair.label,
            imageUrl: showReal ? pair.realUrl : pair.fakeUrl,
            isReal: showReal,
        }
    }).sort(() => Math.random() - 0.5) // shuffle order
}

export type PensievePhase = 'idle' | 'playing' | 'result'

interface PensieveState {
    isActive: boolean
    phase: PensievePhase
    questions: PensieveQuestion[]
    currentIndex: number
    answers: boolean[]        // player's answers
    imageFlip: boolean        // brief flash for answer feedback

    setIsActive: (v: boolean) => void
    startGame: () => void
    answer: (playerSaysReal: boolean) => void
    resetGame: () => void
    setImageFlip: (v: boolean) => void
}

export const usePensieveStore = create<PensieveState>((set, get) => ({
    isActive: false,
    phase: 'idle',
    questions: buildQuestions(),
    currentIndex: 0,
    answers: [],
    imageFlip: false,

    setIsActive: (v) => {
        const was = get().isActive
        if (!v && was) {
            // Reset on leave
            set({ isActive: false, phase: 'idle', questions: buildQuestions(), currentIndex: 0, answers: [], imageFlip: false })
        } else {
            set({ isActive: v })
        }
    },

    startGame: () => set({
        phase: 'playing',
        questions: buildQuestions(),
        currentIndex: 0,
        answers: [],
        imageFlip: false,
    }),

    answer: (playerSaysReal) => {
        const { questions, currentIndex, answers } = get()
        const q = questions[currentIndex]
        const correct = playerSaysReal === q.isReal
        const newAnswers = [...answers, correct]

        // Brief feedback flash.
        // Important: keep updates atomic so we never render the old image with `imageFlip=false`
        // between the fade-out and the index switch (this was visible in prod).
        set({ imageFlip: true, answers: newAnswers })
        setTimeout(() => {
            const state = get()
            const nextIndex = state.currentIndex + 1
            if (nextIndex >= state.questions.length) {
                set({ imageFlip: false, answers: newAnswers, phase: 'result' })
                return
            }

            set({ imageFlip: false, answers: newAnswers, currentIndex: nextIndex })
        }, 350)
    },

    resetGame: () => set({
        phase: 'idle',
        questions: buildQuestions(),
        currentIndex: 0,
        answers: [],
        imageFlip: false,
    }),

    setImageFlip: (v) => set({ imageFlip: v }),
}))
