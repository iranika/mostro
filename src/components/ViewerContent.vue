<template>
  <div class="viewer-content">
    <div v-if="canShowBefore" class="nav-row">
      <button class="btn-nav" type="button" @click="beforeContent">▲前のお話▲</button>
    </div>

    <div v-for="{ index: i, page } in visiblePages" :key="`ep-${i}`" class="episode-block">
      <img
        v-for="(name, j) in page.ImageUrl"
        :key="`img-${i}-${j}`"
        :src="toImageSrc(page, name)"
        :data-fallback-src="toFallbackImageSrc(page, name)"
        :alt="`第${page.Index}話 ${page.Title}`"
        class="img4koma"
        loading="lazy"
        decoding="async"
        @error="onImageError"
      />
    </div>

    <div class="nav-row">
      <button
        v-if="canShowAfter"
        class="btn-nav"
        type="button"
        @click="addContent()"
      >
        ▼続きを表示▼
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { MangaEpisode } from '../lib/mangaData';

function debounce<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

const props = withDefaults(
  defineProps<{
    mangaEpisodes: MangaEpisode[];
    initialPage?: string;
  }>(),
  {
    initialPage: '1',
  },
);

const pages = computed(() => props.mangaEpisodes ?? []);
const visibleIndices = ref<number[]>(createInitialIndices(resolvePageParam(), pages.value));

const range = computed(() => {
  if (visibleIndices.value.length === 0) {
    return { min: -1, max: -1 };
  }
  return {
    min: Math.min(...visibleIndices.value),
    max: Math.max(...visibleIndices.value),
  };
});

const visiblePages = computed(() =>
  visibleIndices.value.flatMap((i) => {
    const page = pages.value[i];
    return page ? [{ index: i, page }] : [];
  }),
);

const canShowBefore = computed(() => visibleIndices.value.length > 0 && range.value.min > 0);
const canShowAfter = computed(
  () => visibleIndices.value.length > 0 && pages.value.length - 1 > range.value.max,
);

function addContent(step = 1) {
  if (pages.value.length === 0 || !canShowAfter.value) return;
  visibleIndices.value.push(range.value.max + step);
}

function beforeContent() {
  if (pages.value.length === 0 || !canShowBefore.value) return;
  visibleIndices.value.unshift(range.value.min - 1);
}

function bottomVisible() {
  const scrollY = window.scrollY;
  const visible = window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;
  return visible + scrollY + 2 >= pageHeight || pageHeight < visible;
}

const onScroll = debounce(() => {
  if (bottomVisible()) addContent();
}, 200);

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));

watch(
  () => props.initialPage,
  () => {
    visibleIndices.value = createInitialIndices(resolvePageParam(), pages.value);
  },
);

function toImageSrc(page: MangaEpisode, filename: string) {
  const { deployPath } = buildImagePaths(page, filename);
  return deployPath;
}

function toFallbackImageSrc(page: MangaEpisode, filename: string) {
  const { devPath } = buildImagePaths(page, filename);
  return devPath;
}

function buildImagePaths(page: MangaEpisode, filename: string) {
  const folder = encodeURIComponent(`${page.Index}_${page.Title}`);
  const file = encodeURIComponent(filename);
  return {
    deployPath: `/manga/${folder}/${file}`,
    devPath: `/src/assets/manga/${folder}/${file}`,
  };
}

function onImageError(event: Event) {
  const img = event.currentTarget as HTMLImageElement | null;
  if (!img) return;

  const fallback = img.dataset.fallbackSrc;
  if (!fallback) return;

  const currentPath = new URL(img.src, window.location.origin).pathname;
  if (currentPath === fallback) return;

  img.src = fallback;
}

defineOptions({
  name: 'ViewerContent',
});

function createInitialIndices(page: string, episodes: MangaEpisode[]) {
  if (episodes.length === 0) return [0];

  const pageInt = Number.parseInt(page, 10);

  if (page === 'latest') {
    return [episodes.length - 1];
  }

  if (Number.isFinite(pageInt) && pageInt > 0) {
    const idx = episodes.findIndex((v) => String(v.Index) === page);
    return [idx >= 0 ? idx : 0];
  }

  return [0];
}

function resolvePageParam(): string {
  if (typeof window !== 'undefined') {
    const fromUrl = new URLSearchParams(window.location.search).get('page');
    if (fromUrl) return fromUrl;
  }
  return props.initialPage;
}
</script>

<style scoped>
.viewer-content {
  width: 100%;
}

.episode-block {
  margin-bottom: 12px;
}

.img4koma {
  width: 100%;
  display: block;
}

.nav-row {
  text-align: center;
  padding: 10px 0;
}

.btn-nav {
  border: 1px solid #bfbfbf;
  background: #ffffff;
  color: #222;
  border-radius: 9999px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
}
</style>

