import createRequest from "@/utils/request"

const serverBaseUrl = import.meta.env.VITE_LIVE_BASE

export function allWolfUrl() {
  return createRequest({
    url: serverBaseUrl + "/api/v1/wolf/urls",
    method: "GET"
  })
}

export function useAllWolfUrl() {
  onMounted(() => {
    allWolfUrl().then(res => {
      sessionStorage.setItem("wolfstr", res.data)
    })
  })
} 