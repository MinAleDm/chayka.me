<script setup lang="ts">
import GithubActivityWidget from "../components/GithubActivityWidget.vue";

type StackGroup = {
  title: string;
  items: string[];
  separator?: string;
};

const stackGroups: StackGroup[] = [
  { title: "Working at", items: ["Easy Commerce"], separator: "/" },
  { title: "Creator of", items: ["StackMIREA"] },
  { title: "Maintaining", items: ["StackMIREA", "DilyBoost", "TeamSync"] }
];

const bioParagraphs: string[] = [
  "Штаб-квартира находится в Москве, UTC+3. Я открыт для продуктовых команд, для которых качество кода является частью процесса разработки, а не второстепенной задачей",
  "Придумывать крутые идеи и воплощать их в жизнь - вот в чем моя страсть. Я с энтузиазмом отношусь к созданию инструментов, которые помогают мне и другим быть более продуктивными и получать удовольствие от процесса разработки",
  "Я выступаю с лекциями и пишу посты в блогах об открытом исходном коде и программировании. Иногда я провожу прямые трансляции по программированию и экспериментирую с искусством и интерактивностью.",
  "Помимо программирования, я увлекаюсь фотографией и путешествиями. Я также люблю аниме и фильмы и слежу за своим медиапотреблением"
];
</script>

<template>
  <section class="page-header reveal home-hero">
    <p class="eyebrow">Frontend / Fullstack Engineer</p>
    <h1 class="page-title">Aleksandr Minkin</h1>
    <p class="page-lead">
      Университет Fullstack из которого ты никогда не выпустишься.
    </p>
    <p class="home-line">
      Работаю с JavaScript/TypeScript, Vue и React и люблю аккуратный DX.
    </p>

    <div class="stack-lines" aria-label="Affiliations">
      <div v-for="group in stackGroups" :key="group.title" class="stack-line">
        <span class="stack-title">{{ group.title }}</span>
        <div class="stack-items">
          <template v-for="(item, index) in group.items" :key="`${group.title}-${item}`">
            <span class="stack-chip">{{ item }}</span>
            <span v-if="group.separator && index < group.items.length - 1" class="stack-separator">
              {{ group.separator }}
            </span>
          </template>
        </div>
      </div>
    </div>

    <div class="home-copy">
      <p v-for="(paragraph, index) in bioParagraphs" :key="index" class="home-status">{{ paragraph }}</p>
    </div>
  </section>

  <hr class="divider reveal" />

  <GithubActivityWidget />

  <hr class="divider reveal" />
  <p class="reveal home-hero">
    Если вам нравится моя работа и вы находите ее полезной, подумайте о том, чтобы спонсировать меня и экосистему, чтобы
    способствовать устойчивому использованию открытого исходного кода.
    Спасибо!
  </p>
</template>
