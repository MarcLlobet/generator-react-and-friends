import React from 'react'
import css from './index.css'

const App = () => {
  return <div className={css.div}>Hello React,Webpack 4 & Babel 7!</div>
}

ReactDOM.render(<App />, document.getElementById('root'))
