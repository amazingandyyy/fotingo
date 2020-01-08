/**
 * Config testsC
 */

import 'jest';

import * as cosmiconfig from 'cosmiconfig';
import * as fs from 'fs';
import { read, write } from 'src/config';
import { Config } from 'src/types';

import { data } from './lib/data';

jest.mock('fs');

jest.mock('cosmiconfig', () => ({
  cosmiconfigSync: jest.fn().mockReturnValue(jest.fn()),
}));

// TODO Use real Config instances for tests

describe('config', () => {
  beforeEach(() => {
    (cosmiconfig.cosmiconfigSync as jest.Mock).mockImplementation(() => ({ search: jest.fn() }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('read', () => {
    test('reads config from current path and home path', () => {
      const search = jest.fn().mockReturnValue({ isEmpty: true });
      (cosmiconfig.cosmiconfigSync as jest.Mock).mockImplementation(() => ({
        search,
      }));
      expect(read()).toEqual({});
      expect(search).toHaveBeenCalledTimes(2);
      expect(search).toBeCalledWith(process.env.HOME);
    });

    test('merges configuration objects', () => {
      const search = jest.fn().mockReturnValueOnce({
        config: {
          git: data.createGitConfig(),
        },
        isEmpty: false,
      });
      search.mockReturnValueOnce({
        config: {
          git: data.createGitConfig(),
        },
        isEmpty: false,
      });
      (cosmiconfig.cosmiconfigSync as jest.Mock).mockImplementation(() => ({
        search,
      }));
      expect(read()).toMatchInlineSnapshot(`
        Object {
          "git": Object {
            "baseBranch": "h/some_hotfix",
            "branchTemplate": "https://charley.biz {issue.key}",
            "remote": "upstream",
          },
        }
      `);
    });
  });

  describe('write', () => {
    let configToWrite: Partial<Config>;

    beforeEach(() => {
      configToWrite = { git: data.createGitConfig() };
    });

    test('writes the config on the found config by default', () => {
      const filepath = '/path/to/config/file';
      const originalConfig = {
        git: data.createGitConfig(),
        jira: data.createJiraConfig(),
      };
      (cosmiconfig.cosmiconfigSync as jest.Mock).mockImplementation(() => ({
        search: jest.fn().mockReturnValue({ config: originalConfig, filepath }),
      }));
      const returnedData = write(configToWrite);
      expect(returnedData).toEqual(configToWrite);
      expect(fs.writeFileSync).toHaveBeenCalledWith(filepath, expect.any(String), 'utf-8');
      const writtenConfig = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      expect(writtenConfig).toMatchInlineSnapshot(`
        "{
          \\"git\\": {
            \\"baseBranch\\": \\"h/some_hotfix\\",
            \\"branchTemplate\\": \\"https://charley.biz {issue.key}\\",
            \\"remote\\": \\"upstream\\"
          },
          \\"jira\\": {
            \\"root\\": \\"https://ethan.info\\",
            \\"user\\": {
              \\"login\\": \\"Jordon_Torphy89@yahoo.com\\",
              \\"token\\": \\"JpanPmRjPhS3hm1\\"
            }
          }
        }"
      `);
    });

    test('fallsback to the user home config file if none can be found', () => {
      write(configToWrite);
      expect(fs.writeFileSync).toHaveBeenCalled();
      const path = (fs.writeFileSync as jest.Mock).mock.calls[0][0];
      const config = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      expect(path).toMatch(/\.fotingorc/);
      expect(config).toMatchInlineSnapshot(`
        "{
          \\"git\\": {
            \\"baseBranch\\": \\"h/some_hotfix\\",
            \\"branchTemplate\\": \\"https://charley.biz {issue.key}\\",
            \\"remote\\": \\"upstream\\"
          }
        }"
      `);
    });
  });
});
