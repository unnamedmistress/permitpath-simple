import React from 'react'
import LessonNavigator from './components/LessonNavigator'

export default function App(){
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Solving Business Problems with AI</h1>
        <p>A friendly, beginner-first course and interactive playground (ChatGPT-style)</p>
      </header>
      <main>
        <LessonNavigator />
      </main>
    </div>
  )
}
