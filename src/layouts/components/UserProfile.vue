<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'


// Obtener la info del usuario iniciado sesión
const getUserInfo = () => {
  const userData = localStorage.getItem('userData');
  const userFullName = JSON.parse(userData).fullName;
  const userFullNameTruncated = truncateToTwoWords(userFullName)
  return userData ? userFullNameTruncated : '';
}

// Función para acortar el nombre
function truncateToTwoWords(text) {
  // Dividir la cadena en palabras
  const words = text.trim().split(/\s+/);

  // Cortar máximo dos palabras
  const result = words.slice(0, 2).join(' ');

  return result;
}

// Info del usuario
const user = ref({
  name: ''
});

const router = useRouter();

const logout = () => {
  // Remover "userData" del localStorage
  localStorage.removeItem('userData')

  // Remover "accessToken" del localStorage
  localStorage.removeItem('accessToken')

  // Remover "userAbilities" del localStorage
  localStorage.removeItem('userAbilities')

  // Redirigir a la página de login
  router.push('/login')
}


onMounted(() => {
  if(localStorage.getItem('userData'))
  {
    user.value.name = getUserInfo();
  }
});

</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <VImg :src="avatar1" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <VImg :src="avatar1" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ user.name }}
            </VListItemTitle>
            <!-- <VListItemSubtitle>Admin</VListItemSubtitle> -->
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 Profile -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-user"
                size="22"
              />
            </template>

            <VListItemTitle>Perfil</VListItemTitle>
          </VListItem>

          <!-- 👉 Settings -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-settings"
                size="22"
              />
            </template>

            <VListItemTitle>Ajustes</VListItemTitle>
          </VListItem>

          <!-- 👉 Pricing -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-currency-dollar"
                size="22"
              />
            </template>

            <VListItemTitle>Pricing</VListItemTitle>
          </VListItem>

          <!-- 👉 FAQ -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-help"
                size="22"
              />
            </template>

            <VListItemTitle>FAQ</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem @click="logout">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="tabler-logout"
                size="22"
              />
            </template>

            <VListItemTitle>Logout</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
