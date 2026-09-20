export function searchArticles(query, articles) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return terms.length ? articles.filter(a => {
    const searchable = JSON.stringify(a).toLocaleLowerCase();
    return terms.every(term => searchable.includes(term));
  }) : [];
}
