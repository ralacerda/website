<script setup lang="ts">
type PostSummary = {
  title: string;
  description: string;
  publishDate: string;
  slug: string;
};

defineProps<{
  postList: PostSummary[];
}>();
</script>

<template>
  <ul class="post-list" role="list">
    <li v-for="post in postList" :key="post.slug">
      <h3>
        <NuxtLinkLocale :to="'/blog/' + post.slug"
          >{{ post.title }}
        </NuxtLinkLocale>
      </h3>
      <NuxtTime
        class="date"
        :datetime="post.publishDate"
        month="long"
        day="numeric"
        year="numeric"
        :locale="$i18n.locale"
      />
      <p>{{ post.description }}</p>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
time {
  display: block;
  margin-bottom: var(--space-xs);
  color: var(--fg-details);
}

li {
  margin-top: var(--space-l);
}

h3 a {
  font-size: var(--step-2);
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: hsl(from var(--red) h calc(s * 1.4) calc(l * 1.3));
  }
}

p {
  color: var(--fg-secondary);
}
</style>
