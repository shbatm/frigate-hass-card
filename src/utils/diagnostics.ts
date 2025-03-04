import { HomeAssistant } from '@dermotduffy/custom-card-helpers';
import pkg from '../../package.json';
import { RawFrigateCardConfig } from '../config/types';
import { getLanguage } from '../localize/localize';
import { DeviceList, getAllDevices } from './ha/device-registry';

type FrigateVersions = Record<string, string>;

interface GitDiagnostics {
  build_version?: string;
  build_date?: string;
  commit_date?: string;
}

export const getReleaseVersion = (): string => {
  const releaseVersion = '__FRIGATE_CARD_RELEASE_VERSION__';
  /* istanbul ignore if: this path cannot be reached during tests as the value
  is substituted by rollup -- @preserve */
  if ((releaseVersion as unknown) === 'dev') {
    return `${releaseVersion}+${pkg['gitAbbrevHash']} (${pkg['buildDate']})`;
  }
  return releaseVersion;
};

export interface Diagnostics {
  card_version: string;
  browser: string;
  date: Date;
  lang: string;
  timezone: string;
  git: GitDiagnostics;

  frigate_versions?: FrigateVersions;
  ha_version?: string;
  config?: RawFrigateCardConfig;
}

export const getDiagnostics = async (
  hass?: HomeAssistant,
  rawConfig?: RawFrigateCardConfig,
): Promise<Diagnostics> => {
  let devices: DeviceList | undefined = [];
  if (hass) {
    try {
      devices = await getAllDevices(hass);
    } catch (e) {
      // Pass. This is optional.
    }
  }

  // Get the Frigate devices in order to extract the Frigate integration and
  // server version numbers.
  const frigateDevices = devices?.filter((device) => device.manufacturer === 'Frigate');
  const frigateVersionMap: Map<string, string> = new Map();
  frigateDevices?.forEach((device) => {
    device.config_entries.forEach((configEntry) => {
      if (device.model) {
        frigateVersionMap.set(configEntry, device.model);
      }
    });
  });

  return {
    card_version: getReleaseVersion(),
    browser: navigator.userAgent,
    date: new Date(),
    ...(frigateVersionMap.size && {
      frigate_versions: Object.fromEntries(frigateVersionMap),
    }),
    lang: getLanguage(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    git: {
      ...(pkg['gitAbbrevHash'] && { hash: pkg['gitAbbrevHash'] }),
      ...(pkg['buildDate'] && { build_date: pkg['buildDate'] }),
      ...(pkg['gitDate'] && { commit_date: pkg['gitDate'] }),
    },
    ...(hass && { ha_version: hass.config.version }),
    ...(rawConfig && { config: rawConfig }),
  };
};
