<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import { ref, watch } from 'vue'
 import { countries, regions, callingCountries } from 'country-data-list';
import { Countries, Provinces, Country, Province } from 'country-and-province';
import { useContactsStore } from "@/stores/contactsStore"
import { useImagesStore } from "@/stores/imageStore"
import { useAuthStore } from "@/stores/authStore"



const accountData = {
  avatarImg: avatar1,
  name: '',
  lastName: '',
  email: '',
  organization: '',
  phone: '',
  country: '',
  address: '',
  city: '',
  postCode: '',
  province: '',
  language: '',
  timezone: '',
  group: '',
  tags: ''
}

const refInputEl = ref()
const isConfirmDialogOpen = ref(false)
const accountDataLocal = ref(structuredClone(accountData))
const router = useRouter();
const route = useRoute();
// Obtener la lista de países utilizando country-data-list
 const countryList = countries.all;
// Obtener solo los nombres de los países
const countryNames = (countryList.map(country => country.name)).sort(); // Ordenamos alfabeticamente
const provincesList = ref([]);
const groupList = ref([]);
const tagsList = ref([]);
const tabs = ref([]);
const activeTab = ref("Básico");
const isLoading = ref(false);
const newContactAdded = ref(false);
// Lista de idiomas, A REVISAR
const topLanguages = [
  'Español',
  'Inglés',
  'Francés',
  'Árabe',
  'Chino Mandarín',
  'Ruso',
  'Portugués',
];

const timezones = [
  '(GMT-11:00) International Date Line West - Midway Island',
  '(GMT-10:00) Hawaii',
  '(GMT-09:00) Alaska',
  '(GMT-08:00) Pacific Time (US & Canada) - Tijuana',
  '(GMT-07:00) Arizona - Chihuahua - La Paz',
  '(GMT-06:00) Central Time (US & Canada) - Mexico City - Monterrey',
  '(GMT-05:00) Bogota - Eastern Time (US & Canada) - Lima',
  '(GMT-04:00) Atlantic Time (Canada) - Caracas - Santiago',
  '(GMT-03:00) Buenos Aires - Greenland',
  '(GMT-02:00) Mid-Atlantic',
  '(GMT-01:00) Azores',
  '(GMT+00:00) London - Dublin - Lisbon',
  '(GMT+01:00) Madrid - Amsterdam - Berlin',
  '(GMT+02:00) Athens - Cairo - Istanbul',
  '(GMT+03:00) Baghdad - Kuwait - Moscow',
  '(GMT+04:00) Abu Dhabi - Baku - Tbilisi',
  '(GMT+05:00) Islamabad - Karachi - Tashkent',
  '(GMT+06:00) Almaty - Dhaka - Novosibirsk',
  '(GMT+07:00) Bangkok - Jakarta - Hanoi',
  '(GMT+08:00) Beijing - Hong Kong - Singapore',
  '(GMT+09:00) Tokyo - Seoul - Osaka',
  '(GMT+10:00) Sydney - Melbourne - Brisbane',
  '(GMT+11:00) Vladivostok - Solomon Is. - Magadan',
  '(GMT+12:00) Auckland - Fiji - Kamchatka',
];

// Función para añadir un contacto
const addNewContact = async () => {
  isLoading.value = true;
  // Aplicamos formato
  const theNewContact = {
    // Datos del nuevo contacto a enviar
    title: accountDataLocal.value.name + " " + accountDataLocal.value.lastName,
    content: '',
    status: 'publish', // Estado del contacto (publicado)
    meta: {
      name: accountDataLocal.value.name,
      lastname: accountDataLocal.value.lastName,
      email: accountDataLocal.value.email,
      company: accountDataLocal.value.organization,
      phone: accountDataLocal.value.phone,
      address: accountDataLocal.value.address,
      city: accountDataLocal.value.city,
      postcode: accountDataLocal.value.postCode,
      province: accountDataLocal.value.province,
      country: accountDataLocal.value.country,
      group: accountDataLocal.value.group,
      tags: accountDataLocal.value.tags,
      language: accountDataLocal.value.language,
      timezone: accountDataLocal.value.timezone,
    }
  };
  // Comprobamos que haya imagen
  let theImage = "";
  // Si es la que viene de serie, subimos la de serie al nuevo contacto
  if(accountDataLocal.value.avatarImg === avatar1 ){
    convertImageToBase64(`@images/avatars/avatar-1.png`)
      .then(async (base64Image) => {
        const imageStore = useImagesStore();
        try {
          const imgUploadedId = await imageStore.uploadFeaturedImage(base64Image, accountDataLocal.value.name)
          if (imgUploadedId) {
            theImage = imgUploadedId
            // Subimos la imagen
            theNewContact.featured_media = theImage;
          }
        } catch (e) {
          console.error(e, "error al subirla")
        }
      })
      .catch((error) => {
        console.error('Error converting image to base64:', error);
      });
  }
  if(accountDataLocal.value.avatarImg !== "" && accountDataLocal.value.avatarImg !== avatar1 ){
    const imageStore = useImagesStore();
    try{
      const imgUploadedId = await imageStore.uploadFeaturedImage(accountDataLocal.value.avatarImg, accountDataLocal.value.name)
      if(imgUploadedId){
        theImage = imgUploadedId
        // Subimos la imagen
        theNewContact.featured_media = theImage;
      }
    } catch (e) {
      console.error(e, "error al subirla")
    }
  }
  await useContactsStore().addContact(theNewContact);
  isLoading.value = false;
  newContactAdded.value = true;
};
const changeAvatar = file => {
  const fileReader = new FileReader()
  const { files } = file.target
  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        accountDataLocal.value.avatarImg = fileReader.result
    }
  }
}

// Función para convertir la imagen a base64
const convertImageToBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = reject;
    // Read the file as a data URL
    fileReader.readAsDataURL(imagePath);
  });
};


// Función para obtener las provincias de un país

const fetchProvinces = async (countryName) => {
  try {
    const countryData = await Countries.byName(countryName);
    const provinceNames = countryData.provinces.data.map(province => province.name);
    provincesList.value = provinceNames.sort();
  } catch (error) {
    console.error('Error al obtener las provincias:', error);
    // En caso de error, establece provincesList como vacío
    provincesList.value = [];
  }
};

// Función para obtener todos los grupos únicos de los contactos
async function getUniqueGroups() {
  const store = useContactsStore();
  await store.fetchContacts();
  // Inicializar un array para almacenar todos los grupos
  const allGroups = store.contacts.reduce((accumulator, contact) => {
    // Agregar los grupos del contacto actual al array acumulador
    accumulator.push(...contact.meta.group);
    return accumulator; // Devolver el acumulador actualizado
  }, []);

  // Utilizar un conjunto (Set) para obtener los grupos únicos y convertirlos de nuevo a un array
  return [...new Set(allGroups)];
}
// Función para obtener todas las tags únicas de los contactos
async function getUniqueTags() {
  const store = useContactsStore();
  if(store.contacts.length<=0){
    await store.fetchContacts();
  }
  // Inicializar un array para almacenar todas las etiquetas
  const allTags = store.contacts.reduce((accumulator, contact) => {
    // Agregar las etiquetas del contacto actual al array acumulador
    accumulator.push(...contact.meta.tags);
    return accumulator; // Devolver el acumulador actualizado
  }, []);

  // Utilizar un conjunto (Set) para obtener los grupos únicos y convertirlos de nuevo a un array
  return [...new Set(allTags)];
}

const goBack = () => {
  router.push("/contacts"); // Volver a la página anterior en el historial de navegación
};


// reset avatar image
const resetAvatar = () => {
  accountDataLocal.value.avatarImg = accountData.avatarImg
}
const resetForm = () => {
  accountDataLocal.value = structuredClone(accountData)
}



onBeforeMount(async () => {
  const authStore = useAuthStore();
  // Verificar si el token de acceso es válido al inicio
  if (!await authStore.validarToken(localStorage.getItem("accessToken"))) {
    const router = useRouter();
    await router.push('/login'); // Reemplaza '/login' con la ruta real de tu página de inicio de sesión
  }
  //Ponemos las tabs
  tabs.value=["Básico","Avanzado"];
  // Inicialmente obtener las provincias del primer país en la lista (podrías cambiarlo según tus necesidades)
  if (countryNames.length > 0) {
    await fetchProvinces(countryNames[236]);
  }
  groupList.value = await getUniqueGroups();
  tagsList.value = await getUniqueTags();
});

onMounted(() => {
  resetForm();
});

// Observar cambios en la selección del país
watch(() => accountDataLocal.value.country, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    // Si cambió el país seleccionado, obtener las provincias correspondientes
    fetchProvinces(newValue);
  }
});


</script>

<template>
  <div>


    <VRow>
    <VCol cols="12">
      <VCard title="Crear Contacto">
        <VCardText class="d-flex" v-if="!newContactAdded">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded
            size="120"
            class="me-5"
            :image="accountDataLocal.avatarImg"
          />

          <!-- 👉 Upload Photo -->
          <form class="d-flex flex-column justify-center gap-4">
            <div class="d-flex flex-wrap gap-4">
              <VBtn
                color="primary"
                @click="refInputEl?.click()"
              >
                <VIcon
                  icon="mdi-cloud-upload-outline"
                  class="d-sm-none"
                />
                <span class="d-none d-sm-block">Subir foto</span>
              </VBtn>

              <input
                ref="refInputEl"
                type="file"
                name="file"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @input="changeAvatar"
              >
            </div>

            <p class="mb-0 text-xs">
              JPG, GIF o PNG permitidos. Tamaño máximo de 800K
            </p>
          </form>
        </VCardText>
        <VCardText v-if="!newContactAdded">
          <VToolbar
            color="grey"
            rounded="t"
          >
            <VTabs
              v-model="activeTab"
              fixed-tabs
            >
              <VTab value="Básico">Básico</VTab>
              <VTab value="Avanzado">Avanzado</VTab>
            </VTabs>
          </VToolbar>
          <!-- 👉 Form -->
          <VForm class="mt-6">
          <VWindow
            v-model="activeTab"
            class="pa-3 "
          >
            <VWindowItem
              value="Básico"
            >
              <VRow>
                <!-- 👉 First Name -->
                <VCol
                  md="6"
                  cols="12"
                >
                  <VTextField
                    v-model="accountDataLocal.name"
                    placeholder="Juan"
                    label="Nombre"
                  />
                </VCol>

                <!-- 👉 Last Name -->
                <VCol
                  md="6"
                  cols="12"
                >
                  <VTextField
                    v-model="accountDataLocal.lastName"
                    placeholder="García"
                    label="Apellidos"
                  />
                </VCol>

                <!-- 👉 Email -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="accountDataLocal.email"
                    label="Email"
                    placeholder="juan@gmail.com"
                    type="email"
                  />
                </VCol>

                <!-- 👉 Organization -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="accountDataLocal.organization"
                    label="Organización/Empresa"
                    placeholder="Renfe"
                  />
                </VCol>

                <!-- 👉 Phone -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="accountDataLocal.phone"
                    label="Número de teléfono"
                    placholder="+34 612 345 678"
                    type="phone"
                  />
                </VCol>

                <!-- 👉 Country -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VSelect
                    v-model="accountDataLocal.country"
                    label="País"
                    :items="countryNames"
                    placeholder="Select Country"
                  />
                </VCol>
                <!-- 👉 Province -->
                <VCol cols="12" md="6">
                  <template v-if="provincesList.length > 0">
                    <VSelect
                      v-model="accountDataLocal.province"
                      label="Provincia"
                      placeholder="Provincia"
                      :items="provincesList"
                      :menu-props="{ maxHeight: 200 }"
                    />
                  </template>
                  <template v-else>
                    <VTextField
                      v-model="accountDataLocal.province"
                      label="Provincia"
                      placeholder="Escribe la provincia aquí"
                    />
                  </template>
                </VCol>
                <!-- 👉 Address -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="accountDataLocal.address"
                    label="Dirección"
                    placeholder="Calle Colón 18, 46001, Valencia"
                  />
                </VCol>

                <!-- 👉 Ciudad -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="accountDataLocal.city"
                    label="Población"
                    placeholder="Valencia"
                  />
                </VCol>

                <!-- 👉 Zip Code -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VTextField
                    v-model="accountDataLocal.postCode"
                    label="Código Postal"
                    placeholder="10001"
                  />
                </VCol>

                <!-- 👉 Language -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VSelect
                    v-model="accountDataLocal.language"
                    label="Idioma"
                    placeholder="Selecciona un idioma"
                    :items="topLanguages"
                  />
                </VCol>

                <!-- 👉 Timezone -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VSelect
                    v-model="accountDataLocal.timezone"
                    label="Zona Horaria"
                    placeholder="Zona Horaria"
                    :items="timezones"
                    :menu-props="{ maxHeight: 200 }"
                  />
                </VCol>

                <!-- 👉 Grupos -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VCombobox
                    v-model="accountDataLocal.group"
                    chips
                    clearable
                    multiple
                    closable-chips
                    clear-icon="mdi-close-circle-outline"
                    :items="groupList"
                    label="Grupo"
                    item-color="#A21212"
                    color="blue"
                    prepend-icon="mdi-filter-variant"
                  />
                </VCol>
                <!-- 👉 Tags -->
                <VCol
                  cols="12"
                  md="6"
                >
                  <VCombobox
                    v-model="accountDataLocal.tags"
                    chips
                    clearable
                    multiple
                    closable-chips
                    clear-icon="mdi-close-circle-outline"
                    :items="tagsList"
                    label="Tags"
                    color="light-green"
                    prepend-icon="mdi-filter-variant"
                  />
                </VCol>
              </VRow>
            </VWindowItem>
            <VWindowItem
              value="Avanzado"
              class="pa-3 darken-3"
            >
              <VRow class="bg-grey-lighten-1 amber-darken-3">
                <p>
                  Más campos si se quiere
                </p>
              </VRow>
            </VWindowItem>
          </VWindow>
            <!-- 👉 Form Actions -->
            <VCol
              cols="12"
              class="d-flex flex-wrap gap-4 justify-end"
            >
              <VBtn
                color="secondary"
                variant="plain"
                type="reset"
                @click="resetForm"
              >
                Limpiar
              </VBtn>
              <VBtn
                color="secondary"
                variant="outlined"
                type="reset"
                @click.prevent="goBack"
              >
                Cancelar
              </VBtn>
              <VBtn
                @click="addNewContact"
                :loading="isLoading"
                loading="purple-lighten-5"
              >
                Crear nuevo contacto
              </VBtn>
            </VCol>
          </VForm>
        </VCardText>
        <VCardText v-if="newContactAdded">
          ¡Contacto añadido correctamente!
          <VCol>
            <VBtn
              color="secondary"
              variant="outlined"
              type="reset"
              @click.prevent="goBack"
            >
              Volver
            </VBtn>
          </VCol>

        </VCardText>
      </VCard>
    </VCol>

  </VRow>
  </div>

</template>
