import 'jest';

import { maybeAskUserToSelectMatches } from 'src/io/input';
import { Messenger } from 'src/io/messenger';
import * as wait from 'waait';

const data = [
  {
    label: 'label 1',
    value: 'value 1',
  },
  {
    label: 'label 2',
    value: 'value 2',
  },
];

const getLabel = (i: typeof data[0]): string => i.label;
const getValue = (i: typeof data[0]): string => i.value;
const getQuestion = (i: string): string => `What do you pick for ${i}?`;

describe('input', () => {
  describe('maybeAskUserToSelectMatches', () => {
    let messenger: Messenger;
    const onMessage = jest.fn();

    beforeEach(() => {
      messenger = new Messenger();
      messenger.onMessage(onMessage);
    });

    afterEach(() => {
      messenger.stop();
      jest.clearAllMocks();
    });
    test('returns an empty list if there is no data', async () => {
      await expect(
        maybeAskUserToSelectMatches(
          {
            data: [],
            getLabel,
            getQuestion,
            getValue,
            options: [],
            useDefaults: false,
          },
          messenger,
        ),
      ).resolves.toEqual([]);
    });

    test('throws an error if there are not matches', async () => {
      await expect(
        maybeAskUserToSelectMatches(
          {
            data: [[]],
            getLabel,
            getQuestion,
            getValue,
            options: ['option'],
            useDefaults: false,
          },
          messenger,
        ),
      ).rejects.toThrow('No match found for option');
    });

    test('returns the first match if there is only one', async () => {
      await expect(
        maybeAskUserToSelectMatches(
          {
            data: [[data[0]]],
            getLabel,
            getQuestion,
            getValue,
            options: [],
            useDefaults: false,
          },
          messenger,
        ),
      ).resolves.toEqual([data[0]]);
    });

    test('returns the first match if useDefaults is true', async () => {
      await expect(
        maybeAskUserToSelectMatches(
          {
            data: [data],
            getLabel,
            getQuestion,
            getValue,
            options: [],
            useDefaults: true,
          },
          messenger,
        ),
      ).resolves.toEqual([data[0]]);
    });

    test('asks the user to select an option otherwise', async () => {
      const optionsPromise = maybeAskUserToSelectMatches(
        {
          data: [data, data],
          getLabel,
          getQuestion,
          getValue,
          options: ['option1', 'option2'],
          useDefaults: false,
        },
        messenger,
      );
      await wait();
      messenger.send('value 1');
      await wait();
      messenger.send('value 2');
      await wait();
      const options = await optionsPromise;
      expect(onMessage).toHaveBeenCalledTimes(2);
      expect(onMessage.mock.calls[0][0]).toMatchSnapshot();
      expect(onMessage.mock.calls[1][0]).toMatchSnapshot();
      expect(options).toMatchSnapshot();
    });
  });
});
