import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layouts/front-shell/front-shell').then(c => c.FrontShell),
    children: [
      {
        path: '',
        loadComponent: () => import('./home/home').then(c => c.Home)
      },
      {
        path: 'about',
        loadComponent: () => import('./about/about').then(c => c.About)
      },

      {
        path: 'course/:id',
        loadComponent: () => import('./course/course').then(c => c.Course)
      },
      {
        path: 'course/:id/quiz',
        loadComponent: () => import('./quiz/quiz-video/quiz-video').then(m => m.QuizVideo),
      },
      {
        path: 'quiz/:quizId/play',
        loadComponent: () => import('./quiz/quiz-play/quiz-play').then(m => m.QuizPlay),
      },

      {
        path: 'community',
        loadComponent: () => import('./community/community').then(c => c.Community)
      },

      {
        path: 'courses',
        loadComponent: () => import('./courses-list/courses-list').then(c => c.CoursesList)
      },

      {
        path: 'perfil',
        loadComponent: () => import('./perfil/perfil').then(c => c.Perfil)
      },
      {
        path: 'mission',
        loadComponent: () => import('./mission/mission').then(c => c.Mission)
      },
      {
        path: 'mission-professor',
        loadComponent: () =>
          import('./mission-professor/mission-professor').then(c => c.MissionProfessor)
      },

    ],
  },

  {
    path: 'login',
    loadComponent: () =>
      import('../../layouts/login-shell/login-shell').then(c => c.LoginShell),
    children: [
      { path: '', loadComponent: () => import('./login/login').then(c => c.Login) },
    ],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../../layouts/login-shell/login-shell').then(c => c.LoginShell),
    children: [
      { path: '', loadComponent: () => import('./register/register').then(c => c.Register) },
    ],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('../../layouts/login-shell/login-shell').then(c => c.LoginShell),
    children: [
      { path: '', loadComponent: () => import('./forgot-password/forgot-password').then(c => c.ForgotPassword) },
    ],
  },
];
