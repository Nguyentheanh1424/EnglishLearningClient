import { createRouter, createWebHistory } from 'vue-router';

// Dynamic imports for lazy-loading
const Login = () => import('../views/Login.vue');
const Register = () => import('../views/Register.vue');
const ForgotPassword = () => import('../views/ForgotPassword.vue');
const ResetPassword = () => import('../views/ResetPassword.vue');
const Dashboard = () => import('../views/Dashboard.vue');
const Test = () => import('../views/Test.vue');
const TestHistory = () => import('../views/TestHistory.vue');
const CreateTest = () => import('../views/CreateTest.vue');
const TestDetail = () => import('../views/TestDetail.vue');
const TestResult = () => import('../views/TestResult.vue');

const routes = [
    { path: '/', redirect: '/login' }, // Đảm bảo gốc luôn chuyển hướng đến login
    { path: '/login', name: 'Login', component: Login, meta: { requiresAuth: false } },
    { path: '/register', name: 'Register', component: Register, meta: { requiresAuth: false } },
    { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword, meta: { requiresAuth: false } },
    { path: '/reset-password', name: 'ResetPassword', component: ResetPassword, meta: { requiresAuth: false } },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/tests', name: 'Tests', component: Test, meta: { requiresAuth: true } },
    { path: '/tests/:id/take', name: 'TestDetail', component: TestDetail, meta: { requiresAuth: true } },
    { path: '/result/:id', name: 'TestResult', component: TestResult, meta: { requiresAuth: true } },
    { path: '/test-history', name: 'TestHistory', component: TestHistory, meta: { requiresAuth: true } },
    { path: '/create-test', name: 'CreateTest', component: CreateTest, meta: { requiresAuth: true } },
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