import { Routes } from '@angular/router';
import { authGuard } from '../../pages/frontoffice/auth/auth.guard';
import { roleGuard } from '../../pages/frontoffice/auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../layouts/back-shell/back-shell').then(c => c.BackShell),
    canActivate: [authGuard, roleGuard(['Admin', 'Professor'])],

    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard').then(c => c.Dashboard),
      },

      // Users (Admin only)
      {
        path: 'users',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./user/users/users').then(c => c.Users),
      },
      {
        path: 'users/create',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./user/user-create/user-create').then(c => c.UserCreate),
      },
      {
        path: 'users/:id/edit',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./user/user-edit/user-edit').then(c => c.UserEdit),
      },

      // Roles (Admin only)
      {
        path: 'roles',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./role/roles/roles').then(c => c.Roles),
      },
      {
        path: 'roles/create',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./role/role-create/role-create').then(c => c.RoleCreate),
      },
      {
        path: 'roles/:id/edit',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./role/role-edit/role-edit').then(c => c.RoleEdit),
      },

      // Areas (Admin + Professor, Professor não edita)
      {
        path: 'areas',
        loadComponent: () =>
          import('./area/areas/areas').then(c => c.Areas),
      },
      {
        path: 'areas/create',
        loadComponent: () =>
          import('./area/area-create/area-create').then(c => c.AreaCreate),
      },
      {
        path: 'areas/:id/edit',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./area/area-edit/area-edit').then(c => c.AreaEdit),
      },

      // Modalities (Admin only + visualização prof)
      {
        path: 'modalities',
        loadComponent: () =>
          import('./modality/modalities/modalities').then(c => c.Modalities),
      },
      {
        path: 'modalities/create',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./modality/modality-create/modality-create').then(c => c.ModalityCreate),
      },
      {
        path: 'modalities/:id/edit',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./modality/modality-edit/modality-edit').then(c => c.ModalityEdit),
      },

      // Courses (Admin + Professor)
      {
        path: 'courses',
        loadComponent: () =>
          import('./course/courses/courses').then(c => c.Courses),
      },
      {
        path: 'courses/create',
        loadComponent: () =>
          import('./course/course-create/course-create').then(c => c.CourseCreate),
      },
      {
        path: 'courses/:id/edit',
        loadComponent: () =>
          import('./course/course-edit/course-edit').then(c => c.CourseEdit),
      },
      {
        path: 'videos',
        loadComponent: () =>
          import('./video/videos/videos').then(c => c.Videos),
      },
      {
        path: 'videos/create',
        loadComponent: () =>
          import('./video/video-create/video-create').then(c => c.VideoCreate),
      },
      {
        path: 'videos/:id/edit',
        loadComponent: () =>
          import('./video/video-edit/video-edit').then(c => c.VideoEdit),
      },
      {
        path: 'quizzes',
        loadComponent: () =>
          import('./quiz/quizzes/quizzes').then(c => c.Quizzes),
      },
      {
        path: 'quizzes/create',
        loadComponent: () =>
          import('./quiz/quiz-create/quiz-create').then(c => c.QuizCreate),
      },
      {
        path: 'quizzes/:id/edit',
        loadComponent: () =>
          import('./quiz/quiz-edit/quiz-edit').then(c => c.QuizEdit),
      },
      {
        path: 'questions',
        loadComponent: () =>
          import('./question/questions/questions').then(c => c.Questions),
      },
      {
        path: 'questions/create',
        loadComponent: () =>
          import('./question/question-create/question-create').then(c => c.QuestionCreate),
      },
      {
        path: 'questions/:id/edit',
        loadComponent: () =>
          import('./question/question-edit/question-edit').then(c => c.QuestionEdit),
      },
    ],
  },
];