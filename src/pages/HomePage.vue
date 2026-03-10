<script setup lang="ts">
import GithubActivityWidget from "../components/GithubActivityWidget.vue";
import easyCommerceLogo from "../assets/images/logos/easy-commerce.jpg";
import stackMireaLogo from "../assets/images/logos/stack-mirea.png";

type StackItem = {
  name: string;
  logo?: string;
  logoAlt?: string;
  href?: string;
};

type StackGroup = {
  title: string;
  items: StackItem[];
  separator?: string;
};

const stackGroups: StackGroup[] = [
  {
    title: "Working at",
    items: [
      {
        name: "Easy Commerce",
        logo: easyCommerceLogo,
        logoAlt: "Easy Commerce logo",
        href: "https://easycomm.ru/"
      }
    ],
    separator: "/"
  },
  {
    title: "Creator of",
    items: [
      {
        name: "StackMIREA",
        logo: stackMireaLogo,
        logoAlt: "StackMIREA logo",
        href: "https://minaledm.github.io/StackMIREA/"
      }
    ]
  },
  {
    title: "Maintaining",
    items: [
      {
        name: "StackMIREA",
        logo: stackMireaLogo,
        logoAlt: "StackMIREA logo",
        href: "https://minaledm.github.io/StackMIREA/"
      },
      { name: "DailyBoost", href: "https://github.com/MinAleDm/DailyBoost" },
      { name: "TeamSync", href: "https://github.com/MinAleDm/TeamSync-Pro" }
    ]
  }
];

const bioParagraphs: string[] = [
  "Штаб-квартира находится в Москве, UTC+3. Я открыт для продуктовых команд, для которых качество кода является частью процесса разработки, а не второстепенной задачей",
  "Придумываю крутые идеи и воплощаю их в жизнь. С большим удовольствием создаю инструменты, которые помогают мне и другим получать удовольствие от процесса разработки.",
  "Я читаю лекции и пишу посты в блогах о программировании. Иногда экспериментирую с искусством и интерактивностью.",
  "Помимо программирования, я увлекаюсь фотографией. Я также люблю аниме и фильмы."
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
          <template v-for="(item, index) in group.items" :key="`${group.title}-${item.name}`">
            <component
              :is="item.href ? 'a' : 'span'"
              class="stack-chip"
              :href="item.href"
              :target="item.href ? '_blank' : undefined"
              :rel="item.href ? 'noreferrer noopener' : undefined"
            >
              <img
                v-if="item.logo"
                :src="item.logo"
                :alt="item.logoAlt ?? `${item.name} logo`"
                class="stack-chip-logo"
                loading="lazy"
                decoding="async"
              />
              {{ item.name }}
            </component>
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
