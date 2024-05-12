<script setup>
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import authV2ForgotPasswordIllustrationBorderedDark from '@images/pages/auth-v2-forgot-password-illustration-bordered-dark.png'
import authV2ForgotPasswordIllustrationBorderedLight from '@images/pages/auth-v2-forgot-password-illustration-bordered-light.png'
import authV2ForgotPasswordIllustrationDark from '@images/pages/auth-v2-forgot-password-illustration-dark.png'
import authV2ForgotPasswordIllustrationLight from '@images/pages/auth-v2-forgot-password-illustration-light.png'
import authV2ForgotPasswordMaskDark from '@images/pages/auth-v2-forgot-password-mask-dark.png'
import authV2ForgotPasswordMaskLight from '@images/pages/auth-v2-forgot-password-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import axios from '@axios'
import { BACK_BASE_URL } from "@/constants"

const authV2ForgotPasswordMask = useGenerateImageVariant(authV2ForgotPasswordMaskLight, authV2ForgotPasswordMaskDark)
const authV2ForgotPasswordIllustration = useGenerateImageVariant(authV2ForgotPasswordIllustrationLight, authV2ForgotPasswordIllustrationDark, authV2ForgotPasswordIllustrationBorderedLight, authV2ForgotPasswordIllustrationBorderedDark, true)
const email = ref('');
const userCode = ref('');
const userNewPassword = ref('');
const resetSendit = ref(false);
const setNewPassword = ref(false);
const settedNewPassword = ref(false);
const validMail = ref(true);
const validCode = ref(true);

// Función para comprobar si una string es un email
const isEmailValid = (email) => {
  // Expresión regular para verificar el formato del correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


// Función para enviar el restablecimiento de contraseña a WordPress utilizando Axios
const sendResetPasswordEmail = async () => {
  validMail.value = isEmailValid(email.value)
  if(validMail){
    try {
      const response = await axios.post(`${BACK_BASE_URL}/wp-json/bdpwr/v1/reset-password`, {
        email: email.value
      });
      // Comprueba si la solicitud fue exitosa
      if (response.status === 200) {
        // Éxito: la solicitud de restablecimiento de contraseña se ha enviado correctamente
        console.log('Se ha enviado la solicitud de restablecimiento de contraseña');
        // Aquí podrías mostrar un mensaje de éxito al usuario
        resetSendit.value = true;
      }
      else {
        // Aquí podrías mostrar un mensaje de error al usuario
        validMail.value = false;
      }
    } catch (error) {
      // Fallo al verificar email
      if (!error.response) {
        // Error de red u otro tipo de error que no sea una respuesta del servidor
        console.log("Error en la conexión. Por favor, revisa tu conexión a internet.");
      } else {
        // Respuesta del servidor con estado 500 (Internal Server Error)
        console.log("Ocurrió un error al verificar el email. Por favor, verifica tú email o contacta con el administrador.");
      }
      // Aquí podrías mostrar un mensaje de error al usuario si ocurre un error de red u otro error
      validMail.value = false;
    }
  }

}
// Función para definir la nueva contraseña del usuario
const setNewPasswordUser = async () => {
  try {
    const response = await axios.post(`${BACK_BASE_URL}/wp-json/bdpwr/v1/set-password`, {
      email: email.value,
      code: userCode.value,
      password: userNewPassword.value
    });

    // Comprueba si la solicitud fue exitosa
    if (response.status === 200) {
      // Éxito: la solicitud de restablecimiento de contraseña se ha enviado correctamente
      console.log('Se ha establecido una nueva contraseña');
      // Aquí podrías mostrar un mensaje de éxito al usuario
      setNewPassword.value = false;
      settedNewPassword.value = true;
    } else {
      // Error: la solicitud de restablecimiento de contraseña ha fallado
      console.error('Error al enviar la solicitud de restablecimiento de contraseña');
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  } catch (error) {
    console.error('Error:', error);
    // Aquí podrías mostrar un mensaje de error al usuario si ocurre un error de red u otro error
  }
}
// Función para validar el código recibido en el email
const validateCodeEmail = async () => {
  try {
    const response = await axios.post(`${BACK_BASE_URL}/wp-json/bdpwr/v1/validate-code`, {
      email: email.value,
      code: userCode.value
    });

    // Comprueba si la solicitud fue exitosa
    if (response.status === 200) {

      console.log('Se ha validado el código de restablecimiento de contraseña');

      validCode.value = true;
      resetSendit.value = false;
      setNewPassword.value = true;
    } else {
      // Error: la solicitud de restablecimiento de contraseña ha fallado
      console.error('Error al enviar la solicitud de restablecimiento de contraseña');
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  } catch (error) {
    // console.error('Error:', error);
    console.log("Parece que el código no es correcto, verifica que lo hayas escrito bien")
    validCode.value = false;
    // Aquí podrías mostrar un mensaje de error al usuario si ocurre un error de red u otro error
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
    class="auth-wrapper"
    no-gutters
  >
    <VCol
      md="8"
      class="d-none d-md-flex align-center justify-center position-relative"
    >
      <div class="d-flex align-center justify-center pa-10">
        <img
          :src="authV2ForgotPasswordIllustration"
          class="auth-illustration w-100"
          alt="auth-illustration"
        >
      </div>
      <VImg
        :src="authV2ForgotPasswordMask"
        class="d-none d-md-flex auth-footer-mask"
        alt="auth-mask"
      />
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));"
      v-if="!setNewPassword && !settedNewPassword"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <h5 class="text-h5 mb-1">
            ¿Contraseña olvidada? 🔒
          </h5>
          <p
            class="mb-0"
            v-if="!resetSendit"
          >
            Escribe tu email y te enviaremos un código para reiniciar tu contraseña
          </p>
          <p
            class="mb-0"
            v-if="resetSendit"
          >
            Escribe el código recibido en el email para restablecer tu contraseña
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <!-- email -->
              <VCol
                cols="12"
                v-if="resetSendit"
              >
                <VTextField
                  v-model="userCode"
                  autofocus
                  label="Código"
                  type="text"
                  placeholder="1A2B/3C"
                />
              </VCol>
              <VCol
                cols="12"
                v-if="!resetSendit"
              >
                <VTextField
                  v-model="email"
                  autofocus
                  label="Email"
                  type="email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- Reset link -->
              <VCol
                cols="12"
                v-if="!resetSendit"
              >
                <VBtn
                  block
                  type="button"
                  @click="sendResetPasswordEmail"
                >
                  Enviar link reinicio de contraseña
                </VBtn>
                <p
                  class="ma-5 text-error"
                  v-if="!validMail"
                >
                  Por favor, escribe un email válido
                </p>
              </VCol>
              <!-- Send code  -->
              <VCol
                cols="12"
                v-if="resetSendit"
              >
                <VBtn
                  block
                  type="button"
                  @click="validateCodeEmail"
                >
                  Validar código de reinicio de contraseña
                </VBtn>
                <p
                  class="ma-5 text-error"
                  v-if="!validCode"
                >
                  Por favor, escribe el código recibido correctamente
                </p>
              </VCol>

              <!-- back to login -->
              <VCol
                cols="12"
                class="text-center"
              >
                <RouterLink
                  class="text-primary ms-2"
                  :to="{ name: 'login' }"
                >
                  <VIcon
                    start
                    size="30"
                    class="flip-in-rtl"
                    icon="mdi-chevron-left"
                  />
                  <span class="text-base">Volver al login</span>
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));"
      v-if="setNewPassword && !settedNewPassword"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <h5 class="text-h5 mb-1">
            Establace tu nueva contraseña 🔒
          </h5>
          <p
            class="mb-0"
          >
            Escribe tu nueva contraseña, ¡recuerda anotarla en un lugar seguro!
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <!-- new password -->
              <VCol
                cols="12"
              >
                <VTextField
                  v-model="userNewPassword"
                  autofocus
                  label="Nueva contraseña"
                  type="password"
                  placeholder="Escribe aquí tu nueva contraseña"
                />
              </VCol>

              <!-- Set reset link -->
              <VCol
                cols="12"
              >
                <VBtn
                  block
                  type="button"
                  @click="setNewPasswordUser"
                >
                  Establecer como nueva contraseña
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol
                cols="12"
                class="text-center"
              >
                <RouterLink
                  class="text-primary ms-2"
                  :to="{ name: 'login' }"
                >
                  <VIcon
                    start
                    size="30"
                    class="flip-in-rtl"
                    icon="mdi-chevron-left"
                  />
                  <span class="text-base">Volver al login</span>
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));"
      v-if="!setNewPassword && settedNewPassword"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <h5 class="text-h5 mb-1">
            ¡Has cambiado correctamente tu nueva contraseña! 🔒
          </h5>
          <p
            class="mb-0"
          >
            Ya puedes volver a la página del login
          </p>
        </VCardText>
        <!-- back to login -->
        <VCol
          cols="12"
          class="text-center"
        >
          <RouterLink
            class="text-primary ms-2"
            :to="{ name: 'login' }"
          >
            <VIcon
              start
              size="30"
              class="flip-in-rtl"
              icon="mdi-chevron-left"
            />
            <span class="text-base">Volver al login</span>
          </RouterLink>
        </VCol>
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
