import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'

const component = React.createElement(App)
const element = document.getElementById('root')

ReactDOM.render(component, element)
