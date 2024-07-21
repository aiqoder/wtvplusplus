
import usePage from "@/hooks/page/usePage";
import { computed, unref } from "vue";
import { AxiosRequestConfig } from 'axios';
import useServe from '@/hooks/http/useServe';

/**
 <div class="mt-4" style="height:30px">
        <a-pagination style="float: right" :total="pagination.total" v-model="pagination.current" show-quick-jumper
          :pageSize.sync="pagination.pageSize" @change="changePage" :show-total="total => `共 ${total} 条`" />
      </div>
pagination, changePage, searchHeader, resultDatas, getModelData

resultCb 真实records
 * **/
export function usePageList(axiosConf: AxiosRequestConfig, pageSize = 10, serialNo = false, resultCb?: (...args: any) => any) {
    const _modelForm = {};

    const {
        reload,
        resultData,
    } = useServe(axiosConf, {});

    //分页
    const { pagination, paginationRawBack, changePage, setPageChnageFunc } = usePage();
    pagination.pageSize = pageSize;

    pagination.total = computed(() => resultCb ? resultCb(unref(resultData))?.total : unref(resultData).total);
    const resultDatas = computed(() => {
        const datas = resultCb ? resultCb(unref(resultData))?.records || [] : unref(resultData).records || []
        const page = paginationRawBack
        if (serialNo) {
            return datas.map((item: AnyObject[], index: number) => ({
                serialNo: (index + 1) + (page.current - 1) * page.pageSize,
                ...item
            }))
        }
        return datas
    });

    //加载
    function load() {
        reload({
            params: {
                current: pagination.current,
                size: pagination.pageSize,
                ..._modelForm
            },
        });
    }
    setPageChnageFunc(load)

    //查询
    function searchHeader(record: Record<string, unknown>) {
        pagination.current = 1
        Object.assign(_modelForm, record);
        load();
    }

    //获取参数
    function getModelData() {
        return _modelForm
    }

    //设置参数
    function setModelData(record: Record<string, unknown>) {
        Object.assign(_modelForm, record)
    }

    //清除返回的数据，有必要的话
    function clearResultDatas() {
        resultData.value = []
    }

    return {
        pagination, changePage, searchHeader, resultDatas, clearResultDatas, getModelData, setModelData, load
    }
}