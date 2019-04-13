window.addEventListener('load', () => {
    const sounds = document.querySelectorAll('.sound')
    const keys = document.querySelectorAll('.keys div')
    const meowBalls = document.querySelector(".meow-balls");
    const colors = [
      'var(--blue)',
      'var(--yellow)',
      'var(--red)',
      'var(--light-yellow)',
      'var(--light-blue)'
    ]
  
    keys.forEach((key, index) => {
      key.addEventListener('click', () => {
        sounds[index].currentTime = 0
        sounds[index].play()
        createBalls(index)
      })
    })
  
    const createBalls = (index) => {
      const ball = document.createElement('div')
      meowBalls.appendChild(ball)
      ball.style.backgroundColor = colors[index]
      ball.style.animation = `jump 1s ease-out`
      ball.addEventListener('animationend', function () {
        meowBalls.removeChild(this)
      })
    }
  })