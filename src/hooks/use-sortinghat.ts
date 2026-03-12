import { create } from 'zustand'

export type House = 'gryffindor' | 'hufflepuff' | 'ravenclaw' | 'slytherin'
export type GamePhase = 'idle' | 'questioning' | 'verdict'

export const HOUSE_META: Record<House, { name: string; color: string; emoji: string; traits: string }> = {
    gryffindor: { name: 'Gryffindor', color: '#c41e3a', emoji: '🦁', traits: 'Brave, Daring, Chivalrous' },
    hufflepuff: { name: 'Hufflepuff', color: '#f0a500', emoji: '🦡', traits: 'Loyal, Patient, Fair' },
    ravenclaw: { name: 'Ravenclaw', color: '#0e4d92', emoji: '🦅', traits: 'Wise, Witty, Curious' },
    slytherin: { name: 'Slytherin', color: '#2a623d', emoji: '🐍', traits: 'Cunning, Ambitious, Resourceful' },
}

export interface QuestionOption {
    text: string
    house: House
}

export interface Question {
    title: string
    situation: string
    options: QuestionOption[]
}

export const QUESTIONS: Question[] = [
    {
        title: 'The Forgotten Wallet',
        situation: "You're walking down a corridor and find a wallet full of gold Galleons on the floor. No one is around. What do you do?",
        options: [
            { text: "Leave it or try to find the owner — it's only fair.", house: 'hufflepuff' },
            { text: "Take it. Fortune favors the bold and clever.", house: 'slytherin' },
            { text: "Hand it to a professor or prefect. Rules exist for a reason.", house: 'ravenclaw' },
            { text: "Look around — if it's not a trap, I'll spend it on something useful for my friends.", house: 'gryffindor' },
        ],
    },
    {
        title: 'Encounter in the Forbidden Forest',
        situation: 'An enraged Acromantula suddenly comes out of the trees towards you. What is your first move?',
        options: [
            { text: 'Draw my wand and charge — I need to protect those with me.', house: 'gryffindor' },
            { text: "Stand still and observe, trying to recall the creature's weaknesses from books.", house: 'ravenclaw' },
            { text: "Retreat slowly or use a distraction to redirect its attention.", house: 'slytherin' },
            { text: 'Try to calm it down, or call for help and hope for a peaceful outcome.', house: 'hufflepuff' },
        ],
    },
    {
        title: 'Your Best Friend is Cheating',
        situation: "You notice your best friend using an enchanted quill that writes answers by itself during an exam. What do you do?",
        options: [
            { text: "Say nothing. Loyalty to my friend matters more than grades.", house: 'hufflepuff' },
            { text: "Ask him to lend me the quill afterwards. It'd be foolish not to take advantage.", house: 'slytherin' },
            { text: "Tell him afterwards that it's unworthy and he should study on his own.", house: 'gryffindor' },
            { text: "Report it. It undermines those who studied honestly.", house: 'ravenclaw' },
        ],
    },
    {
        title: 'The Secret Door',
        situation: "You discover a hidden door that only opens when you solve a complex riddle. What draws you most?",
        options: [
            { text: "The glory of being the first explorer brave enough to enter.", house: 'gryffindor' },
            { text: "The chance to prove my exceptional mind.", house: 'ravenclaw' },
            { text: "A powerful artefact or advantage that might be hidden inside.", house: 'slytherin' },
            { text: "A cozy secret place where friends could gather in safety.", house: 'hufflepuff' },
        ],
    },
    {
        title: 'Your Legacy',
        situation: "Your time at Hogwarts is drawing to a close. How do you want to be remembered?",
        options: [
            { text: "As a great wizard who achieved power and recognition.", house: 'slytherin' },
            { text: "As a hero who performed countless acts of courage.", house: 'gryffindor' },
            { text: "As a sage whose discoveries changed the wizarding world.", house: 'ravenclaw' },
            { text: "As a kind and faithful friend who was always there for others.", house: 'hufflepuff' },
        ],
    },
]

const HOUSES: House[] = ['gryffindor', 'hufflepuff', 'ravenclaw', 'slytherin']
function randomHouse(): House {
    return HOUSES[Math.floor(Math.random() * HOUSES.length)]
}

interface SortingHatState {
    isActive: boolean
    targetHouse: House
    phase: GamePhase
    currentQuestion: number  // 0–4
    answers: House[]         // player's chosen house per question

    setIsActive: (active: boolean) => void
    startGame: () => void
    answerQuestion: (house: House) => void
    resetGame: () => void
}

export const useSortingHatStore = create<SortingHatState>((set, get) => ({
    isActive: false,
    targetHouse: randomHouse(),
    phase: 'idle',
    currentQuestion: 0,
    answers: [],

    setIsActive: (active) => {
        // Pick a fresh random house each time the location becomes active
        if (active && !get().isActive) {
            set({ isActive: active, targetHouse: randomHouse(), phase: 'idle', currentQuestion: 0, answers: [] })
        } else {
            set({ isActive: active })
        }
    },

    startGame: () => set({ phase: 'questioning', currentQuestion: 0, answers: [] }),

    answerQuestion: (house) => {
        const { currentQuestion, answers } = get()
        const newAnswers = [...answers, house]
        if (currentQuestion >= QUESTIONS.length - 1) {
            set({ answers: newAnswers, phase: 'verdict' })
        } else {
            set({ answers: newAnswers, currentQuestion: currentQuestion + 1 })
        }
    },

    resetGame: () => set({ phase: 'idle', currentQuestion: 0, answers: [], targetHouse: randomHouse() }),
}))
