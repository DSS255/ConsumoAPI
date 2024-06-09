const { createApp } = Vue

createApp({
    data() {
        return {
            animes: [],
            searchText: '',
            loading: false
        }
    },
    computed: {
        filteredAnimes() {
            return this.animes.filter(anime => anime.title.toLowerCase().includes(this.searchText.toLowerCase()))
        }
    },
    methods: {
        async fetchAnimes() {
            this.loading = true;
            try {
                const response = await fetch(`https://api.jikan.moe/v4/top/anime`);
                const data = await response.json();
                const animeDetailsPromises = data.data.map(async anime => {
                    const translatedSynopsis = await this.translateText(anime.synopsis);
                    return {
                        mal_id: anime.mal_id,
                        title: anime.title,
                        images: anime.images,
                        synopsis: translatedSynopsis,
                        episodes: anime.episodes,
                        showDetails: true
                    };
                });
                this.animes = await Promise.all(animeDetailsPromises);
                console.log(this.animes);
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        async translateText(text) {
            if (!text) return "";

            const apiKey = '5150b8d3-f7bb-429a-912c-35b652a220fc:fx';
            const url = `https://api-free.deepl.com/v2/translate?auth_key=${apiKey}&text=${encodeURIComponent(text)}&target_lang=PT`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Erro na tradução: ${response.statusText}`);
                }
                const data = await response.json();
                return data.translations[0].text;
            } catch (err) {
                console.error('Erro ao traduzir o texto:', err);
                return text;
            }
        }
    }
}).mount("#app");
