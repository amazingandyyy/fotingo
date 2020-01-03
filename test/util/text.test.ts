import 'jest';

import { findMatches } from 'src/util/text';

describe('text', () => {
  describe('findMatches', () => {
    const data = [
      { title: 'Match', text: 'something else' },
      { title: 'I do not match', text: 'i may match' },
    ];
    test('searches for matches in the specified fields', () => {
      const results = findMatches(
        {
          data,
          fields: ['text'],
        },
        ['match'],
      );
      expect(results).toMatchInlineSnapshot(`
        Array [
          Array [
            Object {
              "text": "i may match",
              "title": "I do not match",
            },
          ],
        ]
      `);
    });

    test('searches for multiple values', () => {
      const results = findMatches(
        {
          data,
          fields: ['title'],
        },
        ['I', 'match'],
      );
      expect(results).toMatchInlineSnapshot(`
        Array [
          Array [
            Object {
              "text": "i may match",
              "title": "I do not match",
            },
          ],
          Array [
            Object {
              "text": "something else",
              "title": "Match",
            },
            Object {
              "text": "i may match",
              "title": "I do not match",
            },
          ],
        ]
      `);
    });

    test('allows to search for exact matches', () => {
      const results = findMatches(
        {
          checkForExactMatchFirst: true,
          cleanData: i => i.toLowerCase(),
          data,
          fields: ['title'],
        },
        ['match'],
      );
      expect(results).toMatchInlineSnapshot(`
        Array [
          Array [
            Object {
              "text": "something else",
              "title": "Match",
            },
          ],
        ]
      `);
    });

    test('falls back to fuzzy search when there is no exact match', () => {
      const results = findMatches(
        {
          checkForExactMatchFirst: true,
          data,
          fields: ['title', 'text'],
        },
        ['mat'],
      );
      expect(results).toMatchInlineSnapshot(`
        Array [
          Array [
            Object {
              "text": "something else",
              "title": "Match",
            },
            Object {
              "text": "i may match",
              "title": "I do not match",
            },
          ],
        ]
      `);
    });
  });
});
