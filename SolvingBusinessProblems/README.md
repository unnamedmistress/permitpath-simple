Solving Business Problems with AI

Course + Interactive App

Overview
This project will host a beginner-friendly interactive course and web app that teaches practical ways to use AI chat tools (ChatGPT-style) to solve everyday business and household problems. The app will be lesson-driven, warm and non-technical, with bite-sized mini-lessons, interactive prompts, drag-and-drop prompt builders, infographics, practice prompts, and quizzes.

Goals
- Create a website/app that looks and feels like a friendly ChatGPT-style assistant.
- Each mini-lesson focuses on a single skill, explains what it is, shows how to use it, includes a highly relevant statistic, an infographic image, practice prompts, a drag-and-drop prompt builder and a short quiz.
- Make it easy for total beginners: plain language, copy-paste prompts, live practice UI, and downloadable summaries.

Stack (initial)
- Frontend: React (Vite) or plain HTML/Vanilla + Stimulus for minimal bundle; Tailwind CSS for quick styling
- Static site generator option: Astro or Next.js if we want SSR later
- Backend (optional): Node/Express server for user progress, or serverless functions
- CLI-friendly: repo scaffolded for rapid iteration

Structure
SolvingBusinessProblems/
  README.md
  app/
    public/
    src/
      index.html
      main.jsx
      App.jsx
      lessons/
        lesson-01-planning-group-decisions.md
  content/
    course-overview.md
    lessons/
  assets/
    infographics/

Next steps
1) Create initial repo scaffold and a single interactive lesson (Lesson 1 with 5 mini-lessons).  
2) Build a small React/Vite app with components: ChatWindow, PromptBuilder (drag-drop), InfographicCard, Quiz, LessonNavigator.  
3) Add sample content and placeholder infographic images.  
4) Iterate on UX: friendly tone, copyable prompts, practice area with simulated AI responses.  

How I can help next
- Generate the initial React/Vite scaffold and commit files.  
- Produce lesson content as markdown pages.  
- Create placeholder infographics (SVGs) for each mini-lesson.  
- Build the drag-and-drop prompt builder UI and quiz components.

Tell me which step to start with: "scaffold app", "create lesson content", "generate infographics", or "build prompt-builder UI".
