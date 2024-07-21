import { reactive, watchEffect } from 'vue';

interface PageOptions {
    pageSize: number;
    current: number;
}

export default function usePage(option?: Partial<PageOptions>) {

    const { current = 1, pageSize = 10 } = option || {}

    const paginationRaw = {
        current,
        pageSize,
        total: 0,
    }
    const paginationRawBack = {
        current: 1,
        pageSize: 10,
        total: 0,
    }

    const pagination = reactive<{
        current: number;
        pageSize: number;
        total: unknown;
    }>(paginationRaw);

    watchEffect(() => {
        Object.assign(paginationRawBack, pagination)
    })

    let _afterFunc = function () {/***/ }

    function changePage(page: number, pageSize: number) {
        pagination.current = page
        pagination.pageSize = pageSize || pagination.pageSize
        _afterFunc()
    }

    function showSizeChange(page: number, pageSize: number) {
        pagination.current = page
        pagination.pageSize = pageSize
        _afterFunc()
    }

    function setPageChnageFunc(func: () => void) {
        _afterFunc = func
    }


    return {
        pagination,
        paginationRawBack,
        changePage,
        showSizeChange,
        setPageChnageFunc
    }
}