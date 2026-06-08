// Точка входа. Порядок важен: сначала глобальный React, затем компоненты
// в порядке их зависимостей (icons → effects → editor → app).
// ES-модули выполняются depth-first по порядку импортов, поэтому
// setup-globals отработает до того, как компоненты прочитают window.React.
import './setup-globals.js'
import './icons.js'
import './effects.js'
import './editor.js'
import './app.js'
