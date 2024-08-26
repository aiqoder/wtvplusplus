<template>
    <div ref="yamlEditor" style="height: 100%;"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref, unref } from 'vue';
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { yaml } from "@codemirror/lang-yaml"
import { oneDark } from '@codemirror/theme-one-dark'
import { useCreateGroupDialog } from '@/store/createGroupDialog';
import { message, notification } from '@/utils/data';
const store = useCreateGroupDialog()
const yamlEditor = ref()

let editor: EditorView;
let timer;
async function initRuleEditorEntity(dom: HTMLDivElement) {
    await store.loadYaml()
    const startState = EditorState.create({
        doc: store.rule,
        extensions: [
            basicSetup,
            oneDark,
            yaml(),
            EditorView.updateListener.of((v) => {
                const load = () => {
                    store.rule = v.state.doc.toString()
                    store.updateYaml(store.rule).catch(err=>{
                        message.error(err.response.data)
                    })
                }

                if(!timer) {
                    timer = setTimeout(() => {
                        load()
                        timer = undefined
                    }, 1000)
                }
            }),
        ],

    })

    if (dom) {
        editor = new EditorView({
            state: startState,
            parent: dom,
        });
    }
}

onMounted(() => {
    initRuleEditorEntity(unref(yamlEditor))
})
</script>
