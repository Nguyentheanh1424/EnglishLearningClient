import { createRouter, createWebHistory } from 'vue-router';

// Dynamic imports for lazy-loading
const Login = () => import('../views/auth/Login.vue');
const Register = () => import('../views/auth/Register.vue');
const ForgotPassword = () => import('../views/auth/ForgotPassword.vue');
const ResetPassword = () => import('../views/auth/ResetPassword.vue');
const Dashboard = () => import('../views/home/Dashboard.vue');
const Test = () => import('../views/test/Test.vue');
const TestHistory = () => import('../views/test/TestHistory.vue');
const CreateTest = () => import('../views/test/CreateTest.vue');
const TestDetail = () => import('../views/test/TestDetail.vue');
const TestResult = () => import('../views/test/TestResult.vue');
const Skills = () => import('../views/Skills.vue')
const Dictionary = () => import('../views/dictionary/Dictionary.vue')
const ListeningTest = () => import('../views/listening/ListeningTest.vue')
const TestListeningResult = () => import('../views/listening/TestListeningResult.vue')
const WritingTest = () => import('../views/writing/WritingTest.vue')
const TestWritingResult = () => import('../views/writing/TestWritingResult.vue')
const SpeakingTest = () => import('../views/speaking/SpeakingTest.vue')
const TestSpeakingResult = () => import('../views/speaking/TestSpeakingResult.vue')
const ReadingTest = () => import('../views/reading/ReadingTest.vue')
const Profile = () => import('../views/auth/Profile.vue')

const routes = [
    { path: '/', redirect: '/login' }, // Đảm bảo gốc luôn chuyển hướng đến login
    { path: '/login', name: 'Login', component: Login, meta: { requiresAuth: false } },
    { path: '/register', name: 'Register', component: Register, meta: { requiresAuth: false } },
    { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword, meta: { requiresAuth: false } },
    { path: '/reset-password', name: 'ResetPassword', component: ResetPassword, meta: { requiresAuth: false } },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },

    // Test
    { path: '/tests', name: 'Tests', component: Test, meta: { requiresAuth: true } },
    { path: '/tests/:id/take', name: 'TestDetail', component: TestDetail, meta: { requiresAuth: true } },
    { path: '/result/:id', name: 'TestResult', component: TestResult, meta: { requiresAuth: true } },
    { path: '/test-history', name: 'TestHistory', component: TestHistory, meta: { requiresAuth: true } },
    { path: '/create-test', name: 'CreateTest', component: CreateTest, meta: { requiresAuth: true } },

    // Skills and Dictionary
    { path: '/skills', name: 'Skill', component: Skills, meta: { requiresAuth: true } },
    { path: '/dictionary', name: 'Dictionary', component: Dictionary , meta: { requiresAuth: true } },

    // Listening
    { path: '/listening/:id', name: 'ListeningTest', component: ListeningTest, meta: { requiresAuth: true } },
    { path: '/listening/result/:id', name: 'TestListeningResult', component: TestListeningResult, meta: { requiresAuth: true } },

    // Writing
    { path: '/writing/:id', name: 'WritingTest', component: WritingTest, meta: { requiresAuth: true } },
    { path: '/writing/result/:id', name: 'TestWritingResult', component: TestWritingResult, meta: { requiresAuth: true } },

    // Speaking
    { path: '/speaking/:id', name: 'SpeakingTest', component: SpeakingTest, meta: { requiresAuth: true } },
    { path: '/speaking/result/:id', name: 'TestSpeakingResult', component: TestSpeakingResult, meta: { requiresAuth: true } },

    // Reading
    { path: '/reading/:id', name: 'ReadingTest', component: ReadingTest, meta: { requiresAuth: true } },

    // Catch route for 404
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    // Thêm query timestamp để tránh cache khi chuyển hướng
    const appendNoCache = (path) => {
        return {
            path,
            query: { t: new Date().getTime() }, // Thêm timestamp để phá cache
        };
    };

    if (requiresAuth && !token) {
        // Chuyển hướng đến login nếu route yêu cầu xác thực nhưng không có token
        next(appendNoCache('/login'));
    } else if (to.path === '/login' && token) {
        // Chuyển hướng đến dashboard nếu đã đăng nhập và cố truy cập login
        next(appendNoCache('/dashboard'));
    } else if (to.path === '/' && !token) {
        // Đảm bảo gốc chuyển hướng đến login nếu chưa đăng nhập
        next(appendNoCache('/login'));
    } else {
        // Thêm query timestamp cho các route không phải login để tránh cache
        if (to.query.t) {
            next();
        } else {
            next(appendNoCache(to.path));
        }
    }
});

export default router;