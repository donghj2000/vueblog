import axios,{AxiosRequestConfig, AxiosResponse} from 'axios';
import {ElMessage} from "element-plus";
import {getCookie} from "../utils";


const request = axios.create({
    baseURL: process.env.NODE_ENV === "development"? "/api":"/api",
})
console.log("env.MODE:")
console.log(process.env.NODE_ENV)

//请求消息里增加csrf头
request.interceptors.request.use((config: AxiosRequestConfig)=>{
    config.headers["X-CSRFToken"] = getCookie("csrftoken");
    //config.headers["Authorization"] = "SimpleJwt " + getCookie("SimpleJwt");  //simple-jwt
    return config;
})

//返回消息里判断返回码
request.interceptors.response.use(
    (response: AxiosResponse)=>{
        const data = response.data;
        //console.log('response=>', response);
        return response;
    },
    ({message, response})=>{
        console.log('err=>', message, response);
        if (response && response.data && response.data.detail) {
            ElMessage({
                message: response.data.detail,
                type: 'error',
                duration: 3000
            });
        } else {
            ElMessage({
                message: message,
                type: 'error',
                duration: 3000
            });
        }

        return Promise.reject(message);
    }
 );

export default request;