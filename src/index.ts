import { Discovery } from './discovery';
import { Config, RequestExclusion, validateConfig } from './config';
import { HttpClient } from '@actions/http-client';
import * as core from '@actions/core';

interface DiscoveryID {
  id: string;
}

const getArray = <T = string>(inputName: string): T[] | undefined => {
  const input = core.getInput(inputName);

  try {
    const elements = JSON.parse(input);

    return elements instanceof Array ? elements : undefined;
  } catch (err) {
    core.debug(inputName + ` failed: ${err}` + ' => ' + input);
  }
};

const apiToken = core.getInput('api_token', { required: true });
const name = core.getInput('name');
const projectId = core.getInput('project_id');
const authObjectId = core.getInput('auth_object_id');
const fileId = core.getInput('file_id');
const crawlerUrls = getArray('crawler_urls');
const poolSize = parseInt(core.getInput('concurrency'), 10) || 10;
const hostsFilter = getArray('hosts_filter');
const excludedEntryPoints = getArray<RequestExclusion>('exclude_entry_points');
const discoveryTypesIn = getArray<Discovery>('discovery_types');
const hostname = core.getInput('hostname');
const subdomainsCrawl =
  core.getBooleanInput('sub_domains_crawl', { required: false }) ?? false;
const maxInteractionsChainLength =
  parseInt(core.getInput('interactions_depth'), 10) || 3;
const optimizedCrawler =
  core.getBooleanInput('smart', { required: false }) ?? true;
const repeaters = getArray('repeaters');

const baseUrl = hostname ? `https://${hostname}` : 'https://app.brightsec.com';

const client = new HttpClient('GitHub Actions', [], {
  allowRetries: true,
  maxRetries: 5,
  headers: { authorization: `Api-Key ${apiToken}` }
});

const create = async (discoveryConfig: Config) => {
  try {
    const response = await client.postJson<DiscoveryID>(
      `${baseUrl}/api/v2/projects/${projectId}/discoveries`,
      discoveryConfig
    );

    if (response.statusCode < 300 && response.result) {
      const { result } = response;
      const url = `${baseUrl}/api/v2/projects/${projectId}/discoveries/${result.id}`;

      core.setOutput('url', url);
      core.setOutput('id', result.id);
    } else {
      core.setFailed(
        `Failed to create discovery. Status code: ${response.statusCode}`
      );
    }
  } catch (err: any) {
    core.setFailed(`Failed (${err.statusCode}) ${err.message}`);
  }
};

const discoveryTypes = !discoveryTypesIn?.length
  ? [Discovery.ARCHIVE]
  : discoveryTypesIn;
const config: Config = {
  name,
  authObjectId,
  discoveryTypes,
  subdomainsCrawl,
  maxInteractionsChainLength,
  poolSize,
  optimizedCrawler,
  ...(repeaters ? { repeaters } : {}),
  ...(crawlerUrls ? { crawlerUrls } : {}),
  ...(fileId ? { fileId } : {}),
  ...(hostsFilter?.length ? { hostsFilter } : {}),
  ...(excludedEntryPoints?.length
    ? {
        exclusions: {
          requests: excludedEntryPoints
        }
      }
    : {})
};

try {
  validateConfig(config);
} catch (e: any) {
  core.setFailed(e.message);
  throw e;
}

create(config);
