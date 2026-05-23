# Project Notes

## Stack
- **Backend:** Node.js + Express + TypeScript + MongoDB
- **Frontend:** React 18 + TypeScript + Webpack + Tailwind CSS
- **Admin:** React 18 + Vite + Ant Design (JavaScript)

---

## Bugs fixed (audit 2026-05-18)

### Crash — Admin dashboard
| File | Bug | Fix |
|------|-----|-----|
| `Admin/Students.jsx` | `adminApi.grantStudentCourses` does not exist → crash on grant | Changed to `adminApi.grantCourses(id, { courseIds })` |
| `Admin/Students.jsx` | `handleDelete` never defined → crash on delete | Added `handleDelete` calling `adminApi.deleteStudent` |
| `Admin/Students.jsx` | Inline edit sets raw record into form (includes `_id`, `email`...) | Changed to call `openEdit(record)` |
| `Admin/Students.jsx` | `err.response?.data?.message` always `undefined` (axios already unwraps) | Changed to `err?.message` |

### Logic errors
| File | Bug | Fix |
|------|-----|-----|
| `Back-end/course.controller.ts` | `adminApproveReview`, `adminUpdateLesson`, `adminDeleteLesson` missing `isValidId` | Added guard before DB call |
| `Back-end/progress.controller.ts` | Division by zero when `totalLessons === 0` → `NaN` saved to DB | Added `totalLessons > 0 ? ... : 0` guard |
| `Back-end/auth.controller.ts` | `resetToken = undefined` does not clear Mongoose field | Changed to `= null as any` |
| `Back-end/index.ts` | `/uploads` static middleware registered twice with conflicting options | Removed duplicate |
| `Front-end/CourseDetail.tsx` | `navigate('/404')` — route does not exist | Render `<NotFoundPage />` directly |
| `Front-end/AuthContext.tsx` | `updateProfile` loses `enrolledCourses` (backend does not populate) | Call `getMe()` after update to get full student |
| `Front-end/StudentDashboard.tsx` | No auth guard, relied on axios 401 hard redirect | Added `useAuth` + `navigate('/login')` |
| `Front-end/MyCoursesPage.tsx` | No auth guard | Added `useAuth` + `navigate('/login')` |
| `Front-end/ProfilePage.tsx` | `setTimeout` in scroll effect had no cleanup → memory leak | Added `return () => clearTimeout(timer)` |

### Minor
| File | Bug | Fix |
|------|-----|-----|
| `Admin/Dashboard.jsx` | `StarOutlined` icon for "unread messages" — wrong semantics | Changed to `MessageOutlined` |
| `Front-end/authApi.ts` | `getMyMessages` return type missing `hasMore`, `nextCursor`, `total` | Updated type |

---

## What was done previously

### Responsive / Scroll fixes
- Removed `flex flex-col` from `body` and `#root` — fixed scroll-freeze on Student Dashboard
- `CourseDetail`: added sticky bottom bar `lg:hidden` for enroll button on mobile
- Admin `Messages`: modal `width="100%" maxWidth:600`, table `scroll x: 'max-content'`
- Admin `AdminProfile`: form grid uses `auto-fit minmax(240px,1fr)` instead of `1fr 1fr`
- Admin `Students`: drawer width `Math.min(480, window.innerWidth - 32)`
- Admin `Dashboard`: chart column `minmax(280px, 340px)` instead of hardcoded `340px`
- `ProfilePage` chat: `maxHeight: min(calc(100vh - 400px), 480px)`

### Performance
- `React.lazy` + `Suspense` for all 10 Frontend pages and 8 Admin pages
- `React.memo` on `CourseCard`, `StarRating`, `EnrolledCourseCard`
- `useMemo` on `AuthContext` value — prevents unnecessary consumer re-renders
- `useCallback` on all AuthContext methods
- `useMemo` + shared `debounce` util in `CoursesSection`

### Code cleanup
- 4 Auth pages share `AuthLayout` + `AuthInput` (removed ~240 lines of duplication)
- `CourseCard` and `MyCoursesPage` use `LEVEL_MAP`/`LEVEL_COLORS` from `constants.ts`
- `CoursesSection` uses `debounce` from `helpers.ts` instead of manual `setTimeout`
- `MyCoursesPage`: extracted `EnrolledCourseCard` out of render function
- Removed unused `DarkTag` + `tagColors` from `Admin/theme.js`
- `CourseCardSkeleton` rebuilt to match exact `CourseCard` layout

### Backend performance
- Removed `.populate('enrolledCourses')` from list view — 95% fewer DB queries
- In-memory cache 5 min for `adminGetStats` + auto-invalidate on mutations
- Cursor-based pagination for messages API

---

## Still to do (low priority)

| Task | Reason not done |
|------|----------------|
| `react-window` virtualization | Only needed when list > 100 items |
| SWR / React Query | Need to evaluate adding dependency |
| Image CDN (Cloudinary) | Needs environment config |
| Admin migrate to TypeScript | Time-consuming, not urgent |
| ESLint + Prettier | Separate setup |
| Move test files to `__tests__/` | Need to update vitest config |
| Remove `firebase/dist/`, `Back-end/dist/` from git | Need to confirm deploy flow first |

---

## Important notes

**Firebase folder** — not removed from git yet, need to confirm whether Firebase Hosting is used.

**Admin dashboard** still uses JavaScript (not TypeScript) — no runtime impact but no type safety.

**Messages API** has cursor pagination — `ProfilePage` currently only reads first page (20 messages), "load more" not implemented yet.
