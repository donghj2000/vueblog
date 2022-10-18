import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/client/Home.vue";
import { store }  from "../store";


const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "Home",
        component: Home,
        meta: {}
    },
    {
        path: "/search/:text/:count",
        name: "Search",
        component: () =>
            import(/* webpackChunkName: "Search" */ "../views/client/Search.vue")
    },
    {
        path: "/articles",
        name: "Articles",
        component: () =>
            import(/* webpackChunkName: "Articles" */ "../views/client/Home.vue")
    },
    {
        path: "/article/", //此路由是从a链接里跳转过来的
        name: "ArticleDetail",
        component: () =>
            import(/* webpackChunkName: "ArticleDetail" */ "../views/client/ArticleDetail.vue")
    },
    {
        path: '/catalog',
        name: 'Catalog',
        component: () =>
               import(/* webpackChunkName: "Catalog" */ "../views/client/Catalog.vue")
    },
    {
        path: "/archive/",
        name: "Archive",
        component: () =>
            import(/* webpackChunkName: "Archive" */ "../views/client/Archive.vue")
    },
    {
        path: '/message',
        name: 'Message',
        component: () =>
            import(/* webpackChunkName: "Message" */ "../views/client/Message.vue")
    },
    {
        path: '/about',
        name: 'About',
        component: () =>
            import(/* webpackChunkName: "About" */ "../views/client/ArticleDetail.vue")
    },
    {
        path: "/login/",
        name: "Login",
        component: () =>
            import(/* webpackChunkName: "Login" */ "../views/admin/Login.vue")
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import(/* webpackChunkName: "Admin" */ "../views/admin/Admin.vue"),
        children: [
            {
                path: '/admin/',
                name: 'Dashboard',
                component: () => import(/* webpackChunkName: "Dashboard" */ "../views/admin/Dashboard.vue"),
            },
            {
                path: '/admin/dashboard',
                name: 'AdminDashboard',
                component: () => import(/* webpackChunkName: "AdminDashboard" */ "../views/admin/Dashboard.vue"),
            },
            {
                path: '/admin/user',
                name: 'UserManagement',
                component: () => import(/* webpackChunkName: "UserManagement" */ "../views/admin/User.vue"),
            },
            {
                path: '/admin/tag',
                name: 'TagManagement',
                component: () => import(/* webpackChunkName: "TagManagement" */ "../views/admin/Tag.vue"),
            },
            {
                path: '/admin/article',
                name: 'ArticleManagement',
                component: () => import(/* webpackChunkName: "ArticleManagement" */ "../views/admin/Article.vue"),
            },
            {
                path: '/admin/comment',
                name: 'CommentManagement',
                component: () => import(/* webpackChunkName: "CommentManagement" */ "../views/admin/Comment.vue"),
            },
            {            
                path: '/admin/message',
                name: 'MessageManagement',
                component: () => import(/* webpackChunkName: "MessageManagement" */ "../views/admin/Message.vue"),
            },
        ]
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});
router.beforeEach((to, from, next) => {
    if (/\/admin/i.test(to.path)
        && (!store.state.user.id ||
            !store.state.user.is_superuser)) {
        next('/login');
        return;
    }
    next()
})
export default router;
