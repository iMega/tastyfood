import {
  googleAnalyticsMeasurementId,
  googleSearchConsoleVerification,
  siteBase,
  siteUrl,
  staticFormsAccessKey,
} from '../../site.config';

export const withBase = (path = '/'): string => {
  const cleanBase = siteBase.replace(/\/+$/g, '');
  const cleanPath = path.replace(/^\/+/g, '');

  return cleanPath ? `${cleanBase}/${cleanPath}` : `${cleanBase}/`;
};

export const absoluteUrl = (path = '/'): string => {
  const cleanPath = path.replace(/^\/+/g, '');

  return new URL(cleanPath, `${siteUrl}/`).toString();
};

export const config = {
  googleAnalyticsMeasurementId,
  googleSearchConsoleVerification,
  siteBase,
  siteUrl,
  staticFormsAccessKey,
};
