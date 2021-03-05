function formatCharacters(characterData) {
  const formattedResponse = characterData.data.results.map(characterItem => {
    return {
      id: characterItem.id,
      name: characterItem.name,
      description: characterItem.description,
      thumbnail: `${characterItem.thumbnail.path}.${characterItem.thumbnail.extension}`
    };
  });
  return formattedResponse;
}

module.exports = {
  formatCharacters,
};