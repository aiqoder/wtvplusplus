import createRequest from '../utils/request';
import { AxiosRequestConfig } from 'axios';
const serverBaseUrl = import.meta.env.VITE_LIVE_BASE

export interface Article {
  title: string;
  content: string
}

export function articleList(current = 1, size = 10) {
  return createRequest({
    url: serverBaseUrl + "/api/v1/post/list",
    params: {
      current,
      size
    }
  })
}

export function articleAll() {
  return createRequest({
    url: serverBaseUrl + "/api/v1/post/all"
  })
}

export const articleAllConf: AxiosRequestConfig = {
  url: serverBaseUrl + "/api/v1/post/all"
}

export function addOrUpdateArticle(a: Article) {
  return createRequest({
    url: serverBaseUrl + "/api/v1/post/update",
    method: "POST",
    data: a
  })
}

export function deleteArticle(id: string) {
  return createRequest({
    url: serverBaseUrl + `/api/v1/post/delete/${id}`,
    method: "DELETE"
  })
}

export function checkedArtice(id: number, checked: number) {
  return createRequest({
    url: serverBaseUrl + "/api/v1/post/approve",
    method: "POST",
    params:{
      id,
      checked
    }
  })
}