<template>
  <div id="loading-bg">
    <div class="loading-logo">
      <!-- svg logo -->
      <svg width="86" height="46" viewBox="0 0 268 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="50.289" height="143.953" rx="25.144" transform="matrix(-.8652 .50142 .49859 .86684 195.571 0)"
              fill="var(--initial-loader-color)" />
        <rect width="50.289" height="143.953" rx="25.144" transform="matrix(-.8652 .50142 .49859 .86684 196.084 0)"
              fill="url(#a)" fill-opacity=".4" />
        <rect width="50.289" height="143.953" rx="25.144" transform="rotate(30.094 86.573 322.042) skewX(.187)"
              fill="var(--initial-loader-color)" />
        <rect width="50.289" height="143.953" rx="25.144" transform="matrix(-.8652 .50142 .49859 .86684 94.197 0)"
              fill="var(--initial-loader-color)" />
        <rect width="50.289" height="143.953" rx="25.144" transform="matrix(-.8652 .50142 .49859 .86684 94.197 0)"
              fill="url(#b)" fill-opacity=".4" />
        <rect width="50.289" height="143.953" rx="25.144" transform="rotate(30.094 35.886 133.493) skewX(.187)"
              fill="var(--initial-loader-color)" />
        <defs>
          <linearGradient id="a" x1="25.144" y1="0" x2="25.144" y2="143.953" gradientUnits="userSpaceOnUse">
            <stop />
            <stop offset="1" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="b" x1="25.144" y1="0" x2="25.144" y2="143.953" gradientUnits="userSpaceOnUse">
            <stop />
            <stop offset="1" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="loading">
      <div class="effect-1 effects"></div>
      <div class="effect-2 effects"></div>
      <div class="effect-3 effects"></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false // Controla si se muestra el loader o no
    };
  }
};
</script>

<style scoped>
/* Aquí puedes añadir estilos personalizados para tu loader */
#loading-bg {
  /* Estilos para el fondo del loader */
}

.loading-logo {
  /* Estilos para el logo del loader */
}

.loading {
  /* Estilos para los efectos de carga */
}

/* Añade estilos adicionales según sea necesario */
</style>
