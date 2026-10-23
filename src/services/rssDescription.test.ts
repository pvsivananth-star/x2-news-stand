import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractRssDescription } from './rssDescription.ts';

test('uses the publisher RSS description in Tamil rather than content:encoded text', () => {
  const item = `
    <item>
      <description><![CDATA[தமிழகத்தின் பல்வேறு பகுதிகளிலும் பரவலாக மழை பெய்து வருகிறது.]]></description>
      <content:encoded><![CDATA[<p>English fallback text that must not replace the Tamil description.</p>]]></content:encoded>
    </item>`;

  assert.equal(
    extractRssDescription(item),
    'தமிழகத்தின் பல்வேறு பகுதிகளிலும் பரவலாக மழை பெய்து வருகிறது.',
  );
});

test('decodes XML entities and strips markup without translating feed text', () => {
  const item = '<item><description><![CDATA[<p>தமிழ் &amp; தமிழ் செய்திகள்</p>]]></description></item>';
  assert.equal(extractRssDescription(item), 'தமிழ் & தமிழ் செய்திகள்');
});

test('returns no description when the RSS item has none', () => {
  assert.equal(extractRssDescription('<item><title>Headline</title></item>'), '');
});
