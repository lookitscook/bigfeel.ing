import test from 'node:test';
import assert from 'node:assert/strict';
import { HOME_COPY, decodeParagraphWords, homeCopyForEmotion, renderHomeCopy } from '../src/home-copy.js';
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

test('word decoding leaves only same-token same-position words stable', () => {
  const decoded = decodeParagraphWords('Alpha beta gamma', 'Alpha zeta gamma', 0, 0);
  assert.match(decoded, /^Alpha [A-F1-9]{4} gamma$/);
  const shifted = decodeParagraphWords('Alpha word gamma', 'Alpha new word gamma', 0, 0);
  assert.match(shifted, /^Alpha [A-F1-9]{4} [A-F1-9]{5}$/);
  assert.equal(decodeParagraphWords('Anything old', 'Entirely new copy', 1, 25), 'Entirely new copy');
});

test('encoded words interpolate length using uppercase hexadecimal glyphs', () => {
  assert.match(decodeParagraphWords('OLD lengthy', 'NEW tiny', 0, 0), /^[A-F1-9]{3} [A-F1-9]{7}$/);
  assert.match(decodeParagraphWords('OLD lengthy', 'NEW tiny', .5, 0), /^N[A-F1-9]{2} ti[A-F1-9]{4}$/);
  assert.equal(decodeParagraphWords('OLD lengthy', 'NEW tiny', 1, 0), 'NEW tiny');
});

test('emotion changes decode through unstable glyphs and finish on exact copy', () => {
  const callbacks = new Map();
  const cancelled = new Set();
  let nextFrame = 1, time = 0;
  class Element {
    constructor(tagName, ownerDocument) {
      this.tagName = tagName.toUpperCase();
      this.ownerDocument = ownerDocument;
      this.children = [];
      this._text = '';
    }
    get textContent() { return this._text; }
    set textContent(value) { this._text = value; this.children = []; }
    replaceChildren(...children) {
      this.children = children;
      this._text = '';
    }
  }
  const view = {
    matchMedia: () => ({ matches: false }),
    performance: { now: () => time },
    requestAnimationFrame(callback) { const id = nextFrame++; callbacks.set(id, callback); return id; },
    cancelAnimationFrame(id) { callbacks.delete(id); cancelled.add(id); },
  };
  const document = {
    defaultView: view,
    createElement: tagName => new Element(tagName, document),
  };
  const container = new Element('div', document);
  container.children = ['One old line.', 'Another old line.', 'A third old line.', 'The last old line.'].map(text => {
    const paragraph = new Element('p', document);
    paragraph.textContent = text;
    return paragraph;
  });

  assert.equal(renderHomeCopy(container, 'Inspired'), true);
  const firstFrame = callbacks.keys().next().value;
  time = 100;
  callbacks.get(firstFrame)(time);
  callbacks.delete(firstFrame);
  assert.notEqual(container.children[0].textContent, HOME_COPY.Inspired[0]);
  assert.ok(container.children[0].textContent.includes(' '));

  const interruptedFrame = callbacks.keys().next().value;
  assert.equal(renderHomeCopy(container, 'Angry', { duration: 420, startedAt: 100 }), true);
  assert.equal(cancelled.has(interruptedFrame), true);
  const penultimateFrame = callbacks.keys().next().value;
  time = 519;
  callbacks.get(penultimateFrame)(time);
  callbacks.delete(penultimateFrame);
  assert.notDeepEqual(container.children.map(paragraph => paragraph.textContent), HOME_COPY.Angry);
  const finalFrame = callbacks.keys().next().value;
  time = 520;
  callbacks.get(finalFrame)(time);
  assert.deepEqual(container.children.map(paragraph => paragraph.textContent), HOME_COPY.Angry);
});
