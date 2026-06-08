// Кладём React/ReactDOM в window ДО загрузки компонентов из design.
// Компоненты (icons/effects/editor/app) читают глобальные React и ReactDOM,
// а app.js в конце вызывает ReactDOM.createRoot(...).render(...).
import React from 'react'
import * as ReactDOM from 'react-dom/client'

window.React = React
window.ReactDOM = ReactDOM
