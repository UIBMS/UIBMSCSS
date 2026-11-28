import {wordpressPatterns,wordpressPatternFile} from '../../../content/wordpress.mjs';

export function getStaticPaths() {
  return wordpressPatterns.map(pattern => ({params: {pattern: pattern.slug}, props: {pattern}}));
}

export function GET({props: {pattern}}) {
  return new Response(wordpressPatternFile(pattern), {
    headers: {'Content-Type': 'text/plain; charset=utf-8'}
  });
}
