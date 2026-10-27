/**
 * Cleans and formats pronunciation strings to ensure legible, standard romanized phonetics
 * across all operating systems without missing font glyph boxes.
 */
export function formatPronunciation(pron?: string): string {
  if (!pron) return '';
  
  // Replace specialized IPA phonetic symbols with readable Latin phonetics
  return pron
    .replace(/[əʌ]/g, 'uh')
    .replace(/[æ]/g, 'a')
    .replace(/[ɑɒɔ]/g, 'o')
    .replace(/[iːɪ]/g, 'ee')
    .replace(/[uːʊ]/g, 'oo')
    .replace(/[ɜː]/g, 'ur')
    .replace(/[tʃ]/g, 'ch')
    .replace(/[dʒ]/g, 'j')
    .replace(/[ʃ]/g, 'sh')
    .replace(/[ʒ]/g, 'zh')
    .replace(/[θð]/g, 'th')
    .replace(/[ŋ]/g, 'ng')
    .replace(/ˈ|ˌ/g, '')
    .trim();
}
