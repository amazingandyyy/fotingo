import 'jest';

import { parseTemplate } from 'src/util/template';

describe('template', () => {
  describe('parseTemplate', () => {
    test('parses a template', () => {
      const parsedTemplate = parseTemplate({
        data: {
          key: 'VALUE',
          'another.key': 'ANOTHER_VALUE',
        },
        template: 'Some {key} and some {another.key}',
      });
      expect(parsedTemplate).toMatchInlineSnapshot(`"Some VALUE and some ANOTHER_VALUE"`);
    });
  });
});
