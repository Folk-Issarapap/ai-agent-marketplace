import { getRequestConfig } from 'next-intl/server';
import { routing } from '../lib/i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[lang]` segment
  const requested = await requestLocale;
  const locale = (requested && routing.locales.includes(requested as typeof routing.locales[number])) ? requested : routing.defaultLocale;

  // Load messages
  const messages = {
    ...(await import(`../messages/${locale}/common.json`)).default,
  };

  return {
    locale,
    messages,
  };
});
