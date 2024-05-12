<script setup>
import { VForm } from 'vuetify/components/VForm'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import axios from '@axios'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2LoginMaskDark from '@images/pages/auth-v2-login-mask-dark.png'
import authV2LoginMaskLight from '@images/pages/auth-v2-login-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import {
  emailValidator,
  requiredValidator,
} from '@validators'
import { BACK_BASE_URL } from "@/constants"
import jwt_decode from 'jwt-decode'

const isPasswordVisible = ref(false)
const validPassword = ref(true)
const authV2LoginMask = useGenerateImageVariant(authV2LoginMaskLight, authV2LoginMaskDark)
const authV2LoginIllustration = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const route = useRoute()
const router = useRouter()
const ability = useAppAbility()
const isLoading = ref(false)

const errors = ref({
  email: undefined,
  password: undefined,
})

const refVForm = ref('')
const email = ref('') // Para prod
const password = ref('') // Para prod
// const email = ref('pauferrandis95@gmail.com') // Quitar
// const password = ref('v&C69!yp8()gO2ywrPU7cYQh') // Quitar
 // const email = ref('pau@suquet.studio') // Quitar
 // const password = ref('3!4rNK5T0!^Du4!v85') // Quitar
const rememberMe = ref(false)


const login = () => {
  // Limpiar accessToken
  isLoading.value = true;
  localStorage.removeItem('accessToken')

  const headers = {
    'Content-Type': 'application/json',
  };

  axios.post(`${BACK_BASE_URL}/wp-json/jwt-auth/v1/token`, {
    username: email.value,
    password: password.value,
  }, { headers })
    .then(r => {
      if (r) {
        const { token, email, nicename, displayName, id } = r.data.data
        // Quitamos el validate, lo gestionamos en el router
        // if (validarToken(token)) {
          localStorage.setItem('accessToken', token)
          const userAbilities = [
            {
              action: 'manage',
              subject: 'all',
            },
          ]

          const userData = {
            id: id,
            email: email,
            username: nicename,
            fullName: displayName,
            role: 'admin',
            abilities: [
              userAbilities,
            ],
          }
          localStorage.setItem('userAbilities', JSON.stringify(ability))
          ability.update(userAbilities)
          localStorage.setItem('userData', JSON.stringify(userData))
          validPassword.value = true;
          isLoading.value = false;
          router.replace(route.query.to ? String(route.query.to) : '/')
        // }
      }
      else {
      }
    }).catch(e => {
    validPassword.value = false;
    const theError = e.response.data.code;
    errors.value = theError
    isLoading.value = false;
    // console.error(e.response.data)

  })
}

// Función para obtener los userAbilities del token JWT
const getUserAbilitiesFromToken = (token) => {
  return new Promise((resolve, reject) => {
    if (token) {
      try {
        const decodedToken = jwt_decode(token) // Decodificar el token JWT
        // Configurar los headers de la solicitud
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
        // Obtenemos el ID del usuario
        const userID = `${decodedToken.data.user.id}`
        // Creamos la URL de la petición
        //const userUrl = `${BACK_BASE_URL}/wp-json/wp/v2/users/${userID}`;
        const userUrl = `/wp-json/wp/v2/users/${userID}`
        axios.get(userUrl, config)
          .then(response => {
            const userData = response.data
            const userRole = userData.roles[0] // El rol del usuario estará en el primer elemento del array 'roles'
            resolve(decodedToken?.userAbilities) // Resolvemos la promesa con los userAbilities del token decodificado
          })
          .catch(error => {
            console.error('Error al obtener la información del usuario:', error)
            reject(error) // Rechazamos la promesa con el error
          })
      } catch (error) {
        console.error("Error al decodificar el token JWT:", error)
        reject(error) // Rechazamos la promesa con el error
      }
    } else {
      console.error("No se encontró ningún token JWT en el almacenamiento local.")
      reject("No se encontró ningún token JWT en el almacenamiento local.") // Rechazamos la promesa
    }
  })
}



const onSubmit = () => {
  if (refVForm.value) {
    refVForm.value.validate().then(({ valid: isValid }) => {
      if (isValid) {
        login();
      } else {
        console.log("Error al verificar tu email o contraseña");
        validPassword.value = false;
      }
    });
  } else {
    validPassword.value = false;
  }
}
</script>

<template>
  <div class="auth-logo d-flex align-center gap-x-2">
    <div>
      <VNodeRenderer :nodes="themeConfig.app.logo" />
    </div>

    <h5 class="text-h5 font-weight-bold leading-normal text-capitalize">
      {{ themeConfig.app.title }}
    </h5>
  </div>
  <VRow
    no-gutters
    class="auth-wrapper"
  >
    <VCol
      md="8"
      class="d-none d-md-flex align-center justify-center position-relative"
    >
      <div class="d-flex align-center justify-center pa-10">
        <img
          :src="authV2LoginIllustration"
          class="auth-illustration w-100"
          alt="auth-illustration"
        >
      </div>
      <VImg
        :src="authV2LoginMask"
        class="d-none d-md-flex auth-footer-mask"
        alt="auth-mask"
      />
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <h5 class="text-h5 mb-1">
            Bienvenido a <span class="text-capitalize">{{ themeConfig.app.title }}</span>! 👋🏻
          </h5>
          <p class="mb-0">
            Inicia sesión para gestionar todos tus Rminders
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="email"
                  label="Email"
                  placeholder="johndoe@email.com"
                  type="email"
                  autofocus
                  :rules="[requiredValidator, emailValidator]"
                  :error-messages="errors.email"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="password"
                  label="Contraseña"
                  placeholder="············"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between mt-1 mb-4">
                  <VCheckbox
                    v-model="rememberMe"
                    label="Recuérdame"
                  />
                  <RouterLink
                    class="text-primary ms-2 mb-1"
                    :to="{ name: 'forgot-password' }"
                  >
                    ¿Contraseña olvidada?
                  </RouterLink>
                </div>

                <VBtn
                  block
                  type="submit"
                  :loading="isLoading"
                >
                  Login
                </VBtn>
                <p
                  class="ma-5 text-error"
                  v-if="!validPassword"
                >
                  Por favor, verifica tu email o contraseña
                </p>
              </VCol>

              <!-- create account -->
              <!-- <VCol
                cols="12"
                class="text-base text-center"
              >
                <span>¿Nuevo en la plataforma?</span>
                <RouterLink
                  class="text-primary ms-2"
                  :to="{ name: 'register' }"
                >
                  Crear una cuenta
                </RouterLink>
              </VCol> -->

            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
  redirectIfLoggedIn: true
</route>
