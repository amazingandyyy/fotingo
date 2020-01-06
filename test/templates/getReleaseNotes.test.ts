import 'jest';

import { editVirtualFile } from 'src/io/file';
import { Messenger } from 'src/io/messenger';
import { getReleaseNotes } from 'src/templates/getReleaseNotes';
import { data } from 'test/lib/data';

jest.mock('src/io/file', () => ({
  editVirtualFile: jest.fn(),
}));

editVirtualFile as jest.Mock;

describe('getReleaseNotes', () => {
  let messenger: Messenger;
  const onMessage = jest.fn();

  beforeEach(() => {
    messenger = new Messenger();
    messenger.onMessage(onMessage);
  });

  afterEach(() => {
    messenger.stop();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  describe('getReleaseNotes', () => {
    test('allows user to edit the release notes', async () => {
      (editVirtualFile as jest.Mock).mockImplementation(
        ({ initialContent }) => `${initialContent} - edited`,
      );
      const releaseNotes = await getReleaseNotes(
        data.createReleaseConfig(),
        messenger,
        data.createRelease(),
        false,
      ).toPromise();
      expect(releaseNotes).toMatchSnapshot();
      expect(onMessage).toHaveBeenCalledTimes(2);
      expect(onMessage.mock.calls[0][0]).toMatchObject({ inThread: true });
      expect(onMessage.mock.calls[1][0]).toMatchObject({ inThread: false });
    });

    test('uses the initial notes if useDefaults is set', async () => {
      const releaseNotes = await getReleaseNotes(
        data.createReleaseConfig(),
        messenger,
        data.createRelease(),
        true,
      ).toPromise();
      expect(releaseNotes).toMatchSnapshot();
      expect(editVirtualFile as jest.Mock).not.toHaveBeenCalled();
      expect(onMessage).not.toHaveBeenCalled();
    });
  });
});
