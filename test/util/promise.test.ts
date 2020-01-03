import 'jest';

import { series } from 'src/util/promise';

describe('promise', () => {
  describe('series', () => {
    test('runs each promise after the previous completed', async () => {
      const series1 = jest.fn().mockResolvedValue(1);
      const series2 = jest.fn().mockResolvedValue(2);
      const results = await series([series1, series2]);
      expect(results).toEqual([1, 2]);
    });

    test('does not call the next promise if one fails', async () => {
      const error = new Error();
      const series1 = jest.fn().mockRejectedValue(error);
      const series2 = jest.fn().mockResolvedValue(2);
      try {
        await series([series1, series2]);
      } catch (e) {
        // eslint-disable-next-line jest/no-try-expect
        expect(e).toEqual(error);
        // eslint-disable-next-line jest/no-try-expect
        expect(series2).not.toHaveBeenCalled();
      }
    });
  });
});
