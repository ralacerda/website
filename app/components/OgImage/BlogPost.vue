<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div
    class="w-full h-full relative"
    :style="{ backgroundColor: '#1f2229', color: '#f7f7f7' }"
  >
    <div
      class="flex absolute bottom-0 right-[-90%]"
      :style="{
        width: '200%',
        height: '200%',
        backgroundImage: `radial-gradient(circle, #1f2229 35%, #222831 100%)`,
      }"
    />
    <div class="p-8">
      <p :style="{ fontSize: '32px', color: '#b7b8ba' }">
        Renato Lacerda · Blog
      </p>
      <h1 :style="{ fontSize: '70px', marginTop: '14px' }">{{ title }}</h1>
      <p :style="{ fontSize: '32px', marginTop: '12px', color: '#f0f0f0' }">
        {{ description }}
      </p>
    </div>
  </div>
</template>
