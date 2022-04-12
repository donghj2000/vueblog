import request from "./index";
import { User, ResponseData, Tag, TagList, Like, Article,ArticleParams, ArticleArray, Catalog, CommentParam, PageInfo, NumberInfo} from "../types" 

export async function getUserList(params: any) {
    return request({
        url: "/user/",
        method: "get",
        params,
    });
}

export async function login(data: any) {
     return request({
         url: "/user/login",
         method:"post",
         data
     })
}

export async function jwtLogin(data: any) {
     return request({
         url: "/jwt_login",
         method:"post",
         data
     })
}

export async function logout() {
    return request({
        url: "/user/logout",
        method: "get"
    })
}

export async function register(data: any) {
    return request({
        url: "/user/",
        method: "post",
        data
    })
}

export async function changePassword(data: any) {
    return request({
        url: "/user/pwd",
        method: "post",
        data
    })
}

export async function forgetPassword(data: any) {
    return request({
        url: "/user/pwd",
        method: "put",
        data
    }) as unknown as ResponseData
}

export async function getUserDetail(userId: number | undefined) {
    return request({
        url: "/user/" + userId + "/",
        method: "get",
    }) as unknown as ResponseData
}

export async function saveUser(method: any, data: User) {
    return request({
        url: "/user/" + data.id + "/",
        method,
        data,
    }) as unknown as ResponseData
}

export async function getTagList(params: any) {
    return request({
        url: "/tag/",
        method: "get",
        params,
    }) as unknown as TagList
}

export async function saveTag(method: string, data: Tag) {
    let url = "/tag/"
    if (["put", "patch"].includes(method)) {
        url += data.id + "/"
    }
    // @ts-ignore
    return request({
        url,
        method,
        data,
    }) as unknown as ResponseData
}

export async function addTag(data: Tag) {
    return request({
        url: "/tag/",
        method: "post",
        data,
    }) as unknown as ResponseData
}

export async function deleteTag(id: number) {
    return request({
        url: "/tag/" + id + "/",
        method: "delete",
    }) as unknown as ResponseData
}

export function getCatalogTree() {
    return request({
        url: "/catalog/",
        method: "get",
    }) as unknown as ResponseData
}

export function saveCatalog(method: any, data: Catalog) {
    let url = "/catalog/"
    if (["put", "patch"].includes(method)) {
        url += data.id + "/"
    }
    return request({
        url,
        method,
        data,
    }) as unknown as ResponseData
}

export function deleteCatalog(catalogId: number) {
    return request({
        url: "/catalog/" + catalogId + "/",
        method: "delete",
    }) as unknown as ResponseData
}

export function getArticleList(params: ArticleParams) {
    return request({
        url: "/article/",
        method: "get",
        params
    }) as unknown as ArticleArray
}

export function getArticleDetail(articleId: number) {
    return request({
        url: "/article/" + articleId + "/",
        method: "get",
    }) as unknown as Article
}

export function remoteSaveArticle(method: any, data: Article) {
    let url = "/article/"
    if (["put", "patch"].includes(method)) {
        url += data.id + "/"
    }
    return request({
        url, 
        method,
        data,
    }) as unknown as Article
}

export function getCommentList(params: CommentParam) {
    return request ({
        url: "/comment/",
        method: "get",
        params,
    }) as unknown as ResponseData
}

export function getTopArticleList() {
    return request({
        url: "/top/",
        method: "get",
    }) as unknown as ResponseData
}

export function getNumbers() {
    return request({
        url: "/number/",
        method: "get",
    }) as unknown as NumberInfo
}

export function postLikeArticle(data: Like) {
    return request ({
        url: "/like/",
        method: "post",
        data,
    })
}

export function getArticleComments(articleId: number) {
    return request({
        url: "/comment/",
        method: "get",
        params: {
            article: articleId
        },
    }) as unknown as ResponseData
}

export function addComment(data: CommentParam) {
    return request({
        url: "/comment/",
        method: "post",
        data,
    })
}

export function getArchiveList(params: PageInfo) {
    return request({
        url: "/archive/",
        method: "get",
        params
    })
}
///////////////////////////////////////////////////
export function getSearchArticleList(params: any) {
    return request({
        url: "/es/",
        method: "get",
        params
    })
}

export function getMessageList(params: any) {
    return request ({
        url: "/message/",
        method: "get",
        params,
    })
}
export function addMessage(data: any) {
    return request({
        url: "/message/",
        method: "post",
        data,
    })
}
