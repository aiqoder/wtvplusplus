<template>
    <div class="pd">
        <RuleEditor />
    </div>
</template>
<script setup lang="ts">
import RuleEditor from "@/components/RuleEditor.vue"
</script>
<style lang="scss" scoped>
.pd {
    padding: 0.5rem;
    overflow: auto;
    height: calc(100vh - 20px);
}
</style>