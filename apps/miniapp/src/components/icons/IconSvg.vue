<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  size?: number
  color?: string
}>()

// Each icon is defined as a function that returns SVG path markup
// Accepts color param so paths without 'fill' inherit the wrapper stroke
const iconDefs: Record<string, (c: string) => string> = {
  // Navigation
  home: (c) => `<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="${c}" fill="none"/>`,
  chat: (c) => `<path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="${c}" fill="none"/>`,
  heart: (c) => `<path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="${c}" fill="none"/>`,
  user: (c) => `<path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="${c}" fill="none"/>`,

  // Actions
  add: (c) => `<path d="M12 4v16m8-8H4" stroke="${c}" fill="none"/>`,
  close: (c) => `<path d="M6 18L18 6M6 6l12 12" stroke="${c}" fill="none"/>`,
  check: (c) => `<path d="M5 13l4 4L19 7" stroke="${c}" fill="none"/>`,
  edit: (c) => `<path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="${c}" fill="none"/>`,
  delete: (c) => `<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="${c}" fill="none"/>`,
  share: (c) => `<path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke="${c}" fill="none"/>`,
  copy: (c) => `<path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="${c}" fill="none"/>`,
  search: (c) => `<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="${c}" fill="none"/>`,
  settings: (c) => `<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="${c}" fill="none"/>`,
  more: (c) => `<circle cx="12" cy="5" r="1.5" fill="${c}"/><circle cx="12" cy="12" r="1.5" fill="${c}"/><circle cx="12" cy="19" r="1.5" fill="${c}"/>`,
  back: (c) => `<path d="M15 19l-7-7 7-7" stroke="${c}" fill="none"/>`,
  forward: (c) => `<path d="M9 5l7 7-7 7" stroke="${c}" fill="none"/>`,
  arrow_up: (c) => `<path d="M5 15l7-7 7 7" stroke="${c}" fill="none"/>`,
  arrow_down: (c) => `<path d="M19 9l-7 7-7-7" stroke="${c}" fill="none"/>`,

  // Pet care
  food: (c) => `<circle cx="12" cy="9" r="5" stroke="${c}" fill="none"/><path d="M6 14c0 2 2 4 6 4s6-2 6-4" stroke="${c}" fill="none"/>`,
  water: (c) => `<path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" stroke="${c}" fill="none"/>`,
  poop: (c) => `<ellipse cx="12" cy="14" rx="5" ry="4" stroke="${c}" fill="none"/><path d="M9 14c0-3 1.5-5 3-5s3 2 3 5" stroke="${c}" fill="none"/>`,
  weight: (c) => `<path d="M12 3a4 4 0 00-4 4v2h8V7a4 4 0 00-4-4z" stroke="${c}" fill="none"/><path d="M4 21h16a1 1 0 001-1v-1a3 3 0 00-3-3H6a3 3 0 00-3 3v1a1 1 0 001 1z" stroke="${c}" fill="none"/>`,
  medicine: (c) => `<rect x="9" y="3" width="6" height="18" rx="2" stroke="${c}" fill="none"/><line x1="12" y1="7" x2="12" y2="17" stroke="${c}"/>`,
  vaccine: (c) => `<path d="M18 8h-2V6a1 1 0 00-1-1H9a1 1 0 00-1 1v2H6" stroke="${c}" fill="none"/><line x1="12" y1="2" x2="12" y2="5" stroke="${c}"/><path d="M12 10v8" stroke="${c}" fill="none"/><path d="M8 14h8" stroke="${c}" fill="none"/>`,
  alert: (c) => `<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="${c}" fill="none"/><line x1="12" y1="9" x2="12" y2="13" stroke="${c}"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="${c}"/>`,
  emergency: (c) => `<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="${c}" fill="none"/><path d="M13.73 21a2 2 0 01-3.46 0" stroke="${c}" fill="none"/>`,
  pet_cat: (c) => `<path d="M16 20v-2c0-1.5-.5-3-2.5-4" stroke="${c}" fill="none"/><path d="M8 20v-2c0-1.5.5-3 2.5-4" stroke="${c}" fill="none"/><ellipse cx="12" cy="10" rx="6" ry="4" stroke="${c}" fill="none"/><circle cx="9" cy="9" r="1" fill="${c}"/><circle cx="15" cy="9" r="1" fill="${c}"/>`,
  pet_dog: (c) => `<path d="M16 16v3a1 1 0 001 1h2a1 1 0 001-1v-4" stroke="${c}" fill="none"/><path d="M4 16v3a1 1 0 001 1h2a1 1 0 001-1v-4" stroke="${c}" fill="none"/><ellipse cx="12" cy="10" rx="7" ry="5" stroke="${c}" fill="none"/><path d="M6 10c-1.5-2-2-4-1-6" stroke="${c}" fill="none"/><path d="M18 10c1.5-2 2-4 1-6" stroke="${c}" fill="none"/><circle cx="9" cy="9" r="1" fill="${c}"/><circle cx="15" cy="9" r="1" fill="${c}"/>`,

  // Feedback
  thumb_up: (c) => `<path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" stroke="${c}" fill="none"/>`,
  thumb_down: (c) => `<path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zM17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" stroke="${c}" fill="none"/>`,
}

/* Encode SVG to base64 for WeChat WXSS compatibility.
   Pure-JS implementation — no TextEncoder / ArrayBuffer needed. */
function encodeSvg(svg: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let result = ''
  // All our SVGs are pure ASCII, so charCodeAt matches UTF-8 byte values
  for (let i = 0; i < svg.length; i += 3) {
    const b1 = svg.charCodeAt(i)
    const b2 = svg.charCodeAt(i + 1)
    const b3 = svg.charCodeAt(i + 2)
    result += chars[b1 >> 2]
    if (!isNaN(b2)) {
      result += chars[((b1 & 3) << 4) | (b2 >> 4)]
      if (!isNaN(b3)) {
        result += chars[((b2 & 15) << 2) | (b3 >> 6)]
        result += chars[b3 & 63]
      } else {
        result += chars[((b2 & 15) << 2)]
        result += '='
      }
    } else {
      result += chars[((b1 & 3) << 4)]
      result += '=='
    }
  }
  return `url(data:image/svg+xml;base64,${result})`
}

// Pre-compute and cache base64 data URIs per color
const iconCache = new Map<string, string>()

const backgroundStyle = computed(() => {
  const sizeVal = props.size || 44
  const colorVal = props.color || '#2D3436'
  const iconFn = iconDefs[props.name]
  if (!iconFn) return null

  const cacheKey = `${props.name}_${colorVal}`

  if (!iconCache.has(cacheKey)) {
    const pathMarkup = iconFn(colorVal)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${pathMarkup}</svg>`
    iconCache.set(cacheKey, encodeSvg(svg))
  }

  return {
    width: sizeVal + 'rpx',
    height: sizeVal + 'rpx',
    backgroundImage: iconCache.get(cacheKey) || '',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }
})
</script>

<template>
  <view v-if="backgroundStyle" class="icon-svg" :style="backgroundStyle" />
  <text v-else class="icon-fallback">!</text>
</template>

<style scoped>
.icon-svg {
  display: inline-block;
  flex-shrink: 0;
}

.icon-fallback {
  line-height: 1;
}
</style>
