//Design Game Function
class Game {
    constructor (word, times){
        this.word = word.toLowerCase().split('')
        this.times = times
        this.guessedLetters = []
        this.status = 'playing'
    }
    
    calculateStatus(){
        const finished = this.word.every((letter) => this.guessedLetters.includes(letter) || letter === ' ')
    
        if (this.times === 0){
            this.status = 'failed'
        } else if (finished){
            this.status = 'finished'
        } else {
            this.status = 'playing'
        }
    }

    get statusMsg(){
        if (this.status === 'playing'){
            return `You have ${this.times} guesses left`
        } else if (this.status === 'failed'){
            return `Nice try! The word is "${this.word.join('')}".`
        } else {
            return `Great work! You guessed the word!`
        }
    }

    get puzzle(){
        let str = ''
        this.word.forEach((letter) => {
            if (this.guessedLetters.includes(letter) || letter === ' '){
                str += letter
            }else{
                str += '*'
            }
        })
        return str
    }


    makeGuess(guess){
        guess = guess.toLowerCase()
        const isUnique = !this.guessedLetters.includes(guess)
        const isBadGuess = !this.word.includes(guess)

        if (this.status !== 'playing'){
            return
        }

        if (isUnique){
            this.guessedLetters = [...this.guessedLetters, guess]
        }
        if (isUnique && isBadGuess ){
            this.times--
        }
        this.calculateStatus()
    }

}

//request puzzel API
const getPuzzle = async (wordCount) => {
    const response = await fetch(`https://puzzle.mead.io/puzzle?wordCount=${wordCount}`)
    if (response.status === 200){
        const data = await response.json()
        return data.puzzle
    } else {
        throw new Error ('Unable to get puzzle')
    }
}

//DOM interaction
const puzzleEL = document.querySelector('#your-guess')
const guessEL = document.querySelector('#remaining-time')

let game1


window.addEventListener('keypress', (e) => {
    const guess = String.fromCharCode(e.charCode)
    game1.makeGuess(guess)
    render()
})

const render = () => {
    puzzleEL.innerHTML =''
    guessEL.textContent = game1.statusMsg

    game1.puzzle.split('').forEach((letter) => {
        const letterEl = document.createElement('span')
        letterEl.textContent = letter
        puzzleEL.appendChild(letterEl)
    })
}

const startGame = async () => {
    const puzzle = await getPuzzle('2')
    game1 = new Game(puzzle,5)
    render()
}

document.querySelector('#reset').addEventListener('click', startGame)
startGame()