const pokeApi = {};

function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon();
    pokemon.number = String(pokeDetail.id).padStart(3, '0');
    pokemon.name = pokeDetail.name;

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    const [type] = types;
    pokemon.types = types;
    pokemon.type = type;

    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;

    const abilities = pokeDetail.abilities.map((ability) => ability.ability.name).join(', ');
    pokemon.abilities = abilities;

    pokemon.species = pokeDetail.species.name;
    pokemon.height = pokeDetail.height;
    pokemon.weight = pokeDetail.weight;

    return pokemon;
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon);
};

pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails);
};

class Pokemon {
    number;
    name;
    type;
    types = [];
    photo;
    stats = [];
    abilities = [];
    species = [];
    height;
    weight;
}

const pokemonList = document.getElementById('pokemonList');
const loadMoreButton = document.getElementById('loadMoreButton');
const loadMoreDetailsButton = document.getElementById('loadMoreDetailsButton');

const maxRecords = 150;
const limit = 28;
let offset = 0;

function convertPokemonToLi(pokemon) {
    return `
        <li id="${pokemon.number}" class="pokemon ${pokemon.type}" data-pokemon='${JSON.stringify(pokemon)}'>
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>

                <img src="${pokemon.photo}" alt="${pokemon.name}">
            </div>
        </li>
    `;
}

function loadPokemonItems(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        const newHtml = pokemons.map(convertPokemonToLi).join('');
        pokemonList.innerHTML += newHtml;
    });
}

loadPokemonItems(offset, limit);

loadMoreButton.addEventListener('click', () => {
    offset += limit;
    loadPokemonItems(offset, limit).then((newHtml) => {
        pokemonList.innerHTML += newHtml;

        if (offset >= maxRecords) {
            loadMoreButton.style.display = 'none';
        }
    });
});

pokemonList.addEventListener('click', function (event) {
    const clickedPokemon = event.target.closest('.pokemon');
    if (clickedPokemon) {
        const pokemonData = JSON.parse(clickedPokemon.getAttribute('data-pokemon'));
        console.log(pokemonData);
        const pokemonName = pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
        const modal = new bootstrap.Modal(document.getElementById('pokemonModal'));
        const modalBody = document.getElementById('pokemonModalBody');
        
        modalBody.innerHTML = `
            <div class="row pokemon ${pokemonData.type}">
            
                <div class="modal-header">
                    <h2 class="modal-title">${pokemonData.name}</h2>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <br>
                <div class="poke-img-container">
                    <img height="150" src="${pokemonData.photo}" alt="${pokemonData.name}">
                </div>
                <div class="moredetail">
                    <table>
                        <thead>
                            <tr class="poke-about-headline">
                                <th>Sobre</th>
                                <th>Estatus Base</th>
                                <th>Evoluções</th>
                                <th>Movimento</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- About section -->
                            <tr>
                                <td>Espécie</td>
                                <td colspan="3">${pokemonData.species}</td>
                            </tr>
                            <tr>
                                <td>Altura</td>
                                <td colspan="3">${pokemonData.height}</td>
                            </tr>
                            <tr>
                                <td>Largura</td>
                                <td colspan="3">${pokemonData.weight}</td>
                            </tr>
                            <tr>
                                <td>Habilidades</td>
                                <td colspan="3">${pokemonData.abilities}</td>
                            </tr>   
                        </tbody>
                    </table>                        
                </div>               
            </div>
        `;

        modal.show();
    }
});

const searchForm = document.querySelector('form');
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const searchInput = document.getElementById('searchInput').value.toLowerCase();

    for (const pokemonElement of pokemonList.children) {
        const pokemonData = JSON.parse(pokemonElement.getAttribute('data-pokemon'));
        const pokemonName = pokemonData.name.toLowerCase();

        if (pokemonName.includes(searchInput)) {
            pokemonElement.style.display = 'block';
        } else {
            pokemonElement.style.display = 'none';
        }
    }

    loadMoreButton.style.display = 'none';
});