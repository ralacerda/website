<template>
  <div class="w-full h-full flex items-center justify-center relative">
    <div
      class="flex absolute bottom-0 left-[-90%]"
      :style="{
        width: '200%',
        height: '200%',
        backgroundImage: `radial-gradient(circle, #1f2229 35%, #222831 100%)`,
      }"
    />
    <div class="flex justify-center relative">
      <h1
        :style="{
          fontSize: '90px',
          marginTop: '12px',
          color: '#f7f7f7',
          padding: '8px',
        }"
      >
        Renato Lacerda
      </h1>
      <h2
        :style="{
          fontSize: '60px',
          color: '#cfd0d1',
          padding: '8px',
        }"
      >
        Desenvolvedor web
      </h2>
    </div>
  </div>
</template>
