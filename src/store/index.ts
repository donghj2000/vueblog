import {InjectionKey} from 'vue'
import {createStore, Store} from 'vuex'
import {Nav, User, ArticleParams} from "../types";
import { getCookie, setCookie, delCookie } from "./../utils/index";

export interface State {
    user: User,
    articleParams:ArticleParams,
    navIndex: string,
    navs: Array<Nav>,
}

export const StateKey: InjectionKey<Store<State>> = Symbol();
export const SET_USER = 'setUser';
export const CLEAR_USER = 'clearUser';
export const SET_NAV_INDEX = 'setNavIndex';
export const SET_ARTICLE_PARAMS = 'setArticleParams';
export const SET_NAV_INDEX_BY_ROUTE = 'setNavIndexByRoute';


export const initDefaultUserInfo = (): User=>{
    let user: User = {
        id: 0,
        username: "",
        nickname: "",
        created_at: "",
        last_login: "",
        avatar: "",
        email: "",
        is_active: false,
        is_superuser: false,
        desc: ""
    };

    let userInfo = getCookie("userInfo");
    if (userInfo) {
        user = JSON.parse(userInfo);
    }
    return user;
}
export const initDefaultArticleParams = (): ArticleParams => {
    let params: ArticleParams = {
        text: undefined,
        search: undefined,
        status: 'Published',
        tags: undefined,
        catalog: undefined,
        page: 1,
        page_size: 10,
    }
    return params
}
export const store = createStore<State>({
    state() {
        return {
            user: initDefaultUserInfo(),
            articleParams: initDefaultArticleParams(),
            navIndex: '1',
            navs: [
                {
                    index: '1',
                    path: '/',
                    name: '主页',
                },
                {
                    index: '2',
                    path: '/catalog',
                    name: '分类',
                },
                {
                    index: '3',
                    path: '/archive',
                    name: '归档',
                },
                {
                    index: '4',
                    path: '/message',
                    name: '留言',
                },
                {
                    index: '5',
                    path: '/about',
                    name: '关于',
                },
            ],
        }
    },
    mutations: {
        setUser(state: object|any, userInfo: object|any) {
            for (const prop in userInfo){
                state[prop] = userInfo[prop];
            }
        },
        clearUser(state: object|any) {
            state.user = initDefaultUserInfo();
        },
        setNavIndex(state: object|any, navIndex: string) {
            state.navIndex = navIndex;
        },
        setArticleParams(state: object | any, params: object) {
            state.articleParams = {...state.articleParams, ...params};
        },
        //setNavIndexByRoute({commit, state: object|any}, route: string) {
        // setNavIndexByRoute(state: object|any, route: string) {
        //     const index = state.navs.findIndex((r: any) => r.path === route)
        //     if (state.navIndex === state.navs[index].index)
        //         return
        //     if (index > -1) {
        //         //commit(SET_NAV_INDEX, state.navs[index].index)
        //         state.navIndex = state.navs[index].index;
        //     }
        // }
    },
    actions: {
        setNavIndexByRoute(store: object|any, route: string) {
            const index = store.state.navs.findIndex((r: any) => r.path === route)
            if (store.state.navIndex === store.state.navs[index].index)
                return
            if (index > -1) {
                //commit(SET_NAV_INDEX, state.navs[index].index)
                store.state.navIndex = store.state.navs[index].index;
            }
        }
    }
})
