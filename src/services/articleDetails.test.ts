import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArticleDetails } from './articleDetails.ts';

test('extracts a concise multi-paragraph summary and article image', () => {
  const html = `
    <html lang="en">
      <head><meta property="og:image" content="/images/story.jpg"></head>
      <body><article>
        <p>The first substantial paragraph describes the main event and its immediate impact on people.</p>
        <p>The second substantial paragraph adds the background and explains what led to this development.</p>
        <p>The third substantial paragraph includes details from officials and information about the response.</p>
        <p>The fourth substantial paragraph describes what is expected to happen next and what remains uncertain.</p>
        <p>The fifth substantial paragraph provides additional context that is less central to the report.</p>
      </article></body>
    </html>`;

  const details = parseArticleDetails(html, 'https://publisher.example/story');
  assert.equal(details.imageUrl, 'https://publisher.example/images/story.jpg');
  assert.ok(details.summary.split('\n\n').length >= 3);
  assert.ok(details.summary.split('\n\n').length <= 4);
  assert.match(details.summary, /first substantial paragraph/);
  assert.match(details.summary, /fifth substantial paragraph/);
});

test('uses the original article image when social metadata is unavailable', () => {
  const html = '<article><img data-src="/photos/article.webp" alt="Story image"><p>This is a sufficiently long paragraph to make a useful one-sentence article body for extraction.</p></article>';
  const details = parseArticleDetails(html, 'https://publisher.example/news/story');
  assert.equal(details.imageUrl, 'https://publisher.example/photos/article.webp');
  assert.match(details.summary, /one-sentence article body/);
});

test('does not invent a summary when the source page has no article text', () => {
  assert.throws(
    () => parseArticleDetails('<article><p>Short text.</p></article>', 'https://publisher.example/story'),
    /not contain enough text/,
  );
});
