<script setup lang="ts">
import type { Imagen } from '~/types/imagen'
import { getApiErrorMessage } from '~/utils/getApiErrorMessage'

const { data: imagenes, pending, error, refresh } = await useFetch<Imagen[]>('/api/imagenes')

/* AGREGAR IMAGEN */
const mostrarFormAgregar = ref(false)
const errorFormAgregar = ref('')
const guardandoNuevaImagen = ref(false)

const formNuevaImagen = reactive({
    nombre: '',
    nombreArchivo: '',
    archivoBase64: ''
})

function resetFormAgregar() {
    formNuevaImagen.nombre = ''
    formNuevaImagen.nombreArchivo = ''
    formNuevaImagen.archivoBase64 = ''
    errorFormAgregar.value = ''
}

function cerrarFormAgregar() {
    mostrarFormAgregar.value = false
    resetFormAgregar()
}

// Esta función lee el archivo del computador y lo transforma a un texto (Base64)
function alSeleccionarArchivo(event: any) {
    const archivo = event.target.files[0]
    if (archivo) {
        formNuevaImagen.nombreArchivo = archivo.name

        const reader = new FileReader()
        reader.onload = (e: any) => {
            formNuevaImagen.archivoBase64 = e.target.result // Aquí queda guardado como texto largo
        }
        reader.readAsDataURL(archivo)
    }
}

async function guardarImagen() {
    guardandoNuevaImagen.value = true
    errorFormAgregar.value = ''

    try {
        await $fetch('/api/imagenes', {
            method: 'POST',
            body: {
                nombre: formNuevaImagen.nombre,
                nombreArchivo: formNuevaImagen.nombreArchivo,
                archivoBase64: formNuevaImagen.archivoBase64,
            }
        })
        cerrarFormAgregar()
        await refresh()
    }
    catch (err: any) {
        errorFormAgregar.value = getApiErrorMessage(err, 'No se pudo guardar la nueva imagen')
    }
    finally {
        guardandoNuevaImagen.value = false
    }
}
</script>

<template>
    <div class="space-y-8">
        <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h1 class="text-3xl font-extrabold tracking-tight text-brand-blue sm:text-4xl">
                    Galería del sistema
                </h1>
                <p class="mt-3 max-w-2xl text-base leading-7 text-brand-gray/80">
                    Visualice y administre las imágenes almacenadas en el servidor.
                </p>
            </div>

            <UButton @click="mostrarFormAgregar = true" variant="outline" color="neutral" icon="i-heroicons-plus">
                Agregar Imagen
            </UButton>
        </section>

        <section class="grid gap-4 md:grid-cols-3">
            <div v-for="imagen in imagenes" :key="imagen.id"
                class="overflow-hidden rounded-xl border border-brand-border bg-white p-3 shadow-sm">
                <img :src="imagen.img" :alt="imagen.nombre" class="h-40 w-full rounded-lg object-cover" />
                <p class="mt-2 text-center text-sm font-semibold text-brand-blue truncate">
                    {{ imagen.nombre }}
                </p>
            </div>
        </section>
    </div>

    <BaseFormModal v-model:open="mostrarFormAgregar" title="Agregar Imagen"
        description="Completa los datos para registrar una nueva imagen en el sistema.">
        <form class="space-y-4" @submit.prevent="guardarImagen">
            <UFormField label="Nombre personalizado" name="nombre">
                <UInput v-model="formNuevaImagen.nombre" color="neutral" variant="outline" class="w-full"
                    placeholder="Ej: Afiche oficial" />
            </UFormField>

            <UFormField label="Seleccionar Archivo" name="archivo">
                <UInput type="file" accept="image/*" color="neutral" variant="outline" class="w-full"
                    @change="alSeleccionarArchivo" />
            </UFormField>

            <UAlert v-if="errorFormAgregar" color="error" variant="soft" icon="i-heroicons-exclamation-circle"
                :title="errorFormAgregar" />

            <div class="flex justify-end gap-3 pt-2">
                <UButton type="button" color="neutral" variant="subtle" @click="cerrarFormAgregar">
                    Cancelar
                </UButton>

                <UButton type="submit" color="neutral" icon="i-heroicons-check" :loading="guardandoNuevaImagen">
                    Agregar Imagen
                </UButton>
            </div>
        </form>
    </BaseFormModal>
</template>