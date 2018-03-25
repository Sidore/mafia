import { createApp } from './index'

export default context => {
    // console.log(context)
    
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp()

    
    router.push(context.url)

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
    
        // console.log("context 1",context)
        // console.log("matchedComponents 2", matchedComponents)
      
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }

      
      // вызов `asyncData()` на всех соответствующих компонентах
      Promise.all(matchedComponents.map(({ asyncData }) => asyncData && asyncData({
        store,
        route: router.currentRoute
      }))).then(() => {
        // isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`)

        context.state = store.state
        resolve(app)
      }).catch(reject)
    }, reject)
  })
}