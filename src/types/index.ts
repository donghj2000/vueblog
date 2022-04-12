export interface User {
    id: number,
    username: string,
    last_login,
    email: string,
    avatar: string | any,
    desc: string | any,
    nickname: string | any,
    is_active?: any,
    is_superuser?: boolean,
    created_at?: string,
}

export interface Nav {
    index: string,
    path: string,
    name: string,
}
export interface ResponseData {
    data?:any,
}
export interface Tag {
    id: number,
    name: string,
    created_at: string,
    modified_at: string,
}
export interface TagList {
    count: number,
    results: Array<Tag> | any
}

export interface Catalog {
    id: number,
    name: string,
    parent: number,
    parents: Array<number>,
    chiildren: Array<Catalog>
}

export interface Article {
    id: number,
    title: string,
    cover: string,
    toc: string,
    excerpt: string,
    keyword: string,
    markdown: string,
    html: string,
    views: number,
    likes: number,
    comments: number,
    words: number,
    tags: Array<number> | any,
    tags_info: Array<Tag> | any,
    catalog: number,
    catalog_info: Catalog,
    created_at: string,
    modified_at: string,
    author: string,
    status?: string,
}
export interface ArticleArray{
    count: number,
    results: Array<Article> | any
}

export interface ArticleParams {
    search: string | any,
    text: string | any,
    status: string |  any,
    tags: Array<number> | any,
    catalog: number | any,
    page: number,
    page_size: number,
}
export interface CommentInfo {
    id: number,
    user: number,
    user_info: User | any,
    article: number,
    article_info: Article | any,
    created_at: string,
    reply: number | any,
    content: string,
    comment_replies: CommentInfo | any,
}

export interface CommentParam {
    user: number,
    search: string | any,
    article: number,
    reply: number | any,
    content: string,
    page: number,
    page_size: number
}

export interface NumberInfo {
    views: number,
    likes: number,
    comments: number,
    messages: number
}

export interface Like {
    article: number,
    user: number,
}

export interface PageInfo {
    page: number,
    page_size: number
}

export interface ArticleArchiveList {
    year: number,
    list: Array<Article> | any
}

export interface MessageInfo {
    email: string,
    content: string,
    phone: string,
    name: string
}

export interface MessageParam {
    search: string,
    page: number,
    page_size: number
}








