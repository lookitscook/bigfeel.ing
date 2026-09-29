import test from 'node:test';
import assert from 'node:assert/strict';
import { HOME_COPY, homeCopyForEmotion, renderHomeCopy } from '../src/home-copy.js';
import { PAD_EMOTIONS } from '../src/pad-model.js';

test('every selectable emotion has four paragraphs of homepage copy', () => {
  assert.deepEqual(Object.keys(HOME_COPY).sort(), PAD_EMOTIONS.map(([name]) => name).sort());
  for (const [emotion, paragraphs] of Object.entries(HOME_COPY)) {
    assert.equal(paragraphs.length, 4, emotion);
    assert.ok(paragraphs.every(paragraph => paragraph.trim().length > 0), emotion);
    assert.equal(homeCopyForEmotion(emotion.toLowerCase()), paragraphs);
  }
  assert.equal(homeCopyForEmotion('unknown'), null);
});

test('rendering emotion copy replaces the homepage paragraphs as text', () => {
  const created = [];
  const container = {
    ownerDocument: {
      createElement(tagName) {
        const element = { tagName, textContent: '' };
        created.push(element);
        return element;
      },
    },
    replaceChildren(...children) { this.children = children; },
  };
  assert.equal(renderHomeCopy(container, 'Inspired'), true);
  assert.equal(container.children.length, 4);
  assert.deepEqual(container.children, created);
  assert.ok(container.children.every(paragraph => paragraph.tagName === 'p'));
  assert.deepEqual(container.children.map(paragraph => paragraph.textContent), HOME_COPY.Inspired);
  assert.equal(renderHomeCopy(container, 'unknown'), false);
  assert.deepEqual(container.children, created);
});
