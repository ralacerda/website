<template>
  <svg class="filter-wrapper">
    <filter id="filter">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.6"
        stitchTiles="stitch"
      />
    </filter>
  </svg>
</template>

<style>
body::before {
  position: fixed;
  left: 0;
  top: 0;
  content: "";
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 3%;
  filter: url(#filter);
}

.filter-wrapper {
  height: 0;
}

body {
  position: relative;
}
</style>
