import Rx from 'rx-lite'

const webpackDone$ = Rx.Observable.create((observer) => {
  let i = 0
  setInterval(() => observer.onNext(i++), 1000)
}).publish()

webpackDone$.subscribe((i) => {
  console.log('a', i)
})

webpackDone$.connect()

setTimeout(() => {
  webpackDone$.subscribe((i) => {
    console.log('b', i)
  })
}, 5000)
