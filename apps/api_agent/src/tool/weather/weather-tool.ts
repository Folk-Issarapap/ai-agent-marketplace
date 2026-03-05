import { UIToolInvocation, tool } from 'ai';
import { z } from 'zod';

const log = (msg: string, ...args: unknown[]) => {
  const time = new Date().toISOString();
  console.log(`[${time}] [Weather Tool] ${msg}`, ...args);
};

const WEATHER_LABELS: Record<number, string> = {
  0: 'clear', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast', 45: 'foggy', 48: 'depositing rime fog',
  51: 'light drizzle', 53: 'drizzle', 55: 'dense drizzle', 61: 'slight rain', 63: 'moderate rain', 65: 'heavy rain',
  66: 'light freezing rain', 67: 'freezing rain', 71: 'slight snow', 73: 'snow', 75: 'heavy snow', 77: 'snow grains',
  80: 'slight rain showers', 81: 'rain showers', 82: 'violent rain showers', 85: 'slight snow showers', 86: 'snow showers',
  95: 'thunderstorm', 96: 'thunderstorm with slight hail', 99: 'thunderstorm with heavy hail',
};

function getWeatherLabel(code: number): string {
  return WEATHER_LABELS[code] ?? 'unknown';
}

type GeocodeResult = { name: string; latitude: number; longitude: number; timezone: string; country: string };

async function geocode(location: string): Promise<GeocodeResult | null> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', location.trim());
  url.searchParams.set('count', '1');
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: Array<{ name: string; latitude: number; longitude: number; timezone: string; country: string }> };
  const first = data.results?.[0];
  if (!first) return null;
  return { name: first.name, latitude: first.latitude, longitude: first.longitude, timezone: first.timezone, country: first.country };
}

type CurrentWeather = { temperature: number; apparentTemperature: number; humidity: number; weatherCode: number; windSpeed: number; windDirection: number };
type DailyForecast = { date: string; tempMax: number; tempMin: number; weatherCode: number };

async function fetchWeather(
  lat: number, lon: number, timezone: string, unit: 'celsius' | 'fahrenheit', forecastDays: number
): Promise<{ current: CurrentWeather; daily: DailyForecast[] } | null> {
  const tempUnit = unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('timezone', timezone);
  url.searchParams.set('temperature_unit', tempUnit);
  url.searchParams.set('forecast_days', String(Math.min(7, Math.max(1, forecastDays))));
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m');
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code');

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = (await res.json()) as {
    current?: { temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; weather_code: number; wind_speed_10m: number; wind_direction_10m: number };
    daily?: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] };
  };
  const cur = data.current;
  const daily = data.daily;
  if (!cur || !daily?.time?.length) return null;

  const current: CurrentWeather = {
    temperature: cur.temperature_2m,
    apparentTemperature: cur.apparent_temperature,
    humidity: cur.relative_humidity_2m,
    weatherCode: cur.weather_code,
    windSpeed: cur.wind_speed_10m,
    windDirection: cur.wind_direction_10m,
  };

  const dailyList: DailyForecast[] = daily.time.slice(0, forecastDays).map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max[i] ?? current.temperature,
    tempMin: daily.temperature_2m_min[i] ?? current.temperature,
    weatherCode: daily.weather_code[i] ?? cur.weather_code,
  }));

  return { current, daily: dailyList };
}

export const weatherTool = tool({
  description:
    'Get current weather and optional multi-day forecast for a city or location. Use this whenever the user asks about weather, temperature, rain, or forecast in a place. Call with the location name (e.g. Bangkok, Tokyo, London).',
  needsApproval: true,
  inputSchema: z.object({
    location: z.string().min(1).describe('City or place name (e.g. Bangkok, Chiang Mai, Tokyo)'),
    unit: z.enum(['celsius', 'fahrenheit']).optional().describe('Temperature unit; default celsius'),
    forecastDays: z.coerce.number().min(0).max(7).optional().describe('Number of days for forecast (0 = current only); default 3'),
  }),
  async *execute({ location, unit = 'celsius', forecastDays = 3 }) {
    log('Execute — location:', location, 'unit:', unit, 'forecastDays:', forecastDays);
    yield { state: 'loading' as const };
    const geo = await geocode(location);
    if (!geo) {
      log('Geocode not found for:', location);
      yield { state: 'ready' as const, error: 'location_not_found', message: `Could not find location: ${location}. Try a different city or place name.` };
      return;
    }

    const weather = await fetchWeather(geo.latitude, geo.longitude, geo.timezone, unit, forecastDays ?? 0);
    if (!weather) {
      log('Weather fetch failed for:', geo.name);
      yield { state: 'ready' as const, error: 'weather_unavailable', message: 'Weather data is temporarily unavailable. Please try again later.' };
      return;
    }

    const condition = getWeatherLabel(weather.current.weatherCode);
    log('Result:', condition, weather.current.temperature, unit, 'for', geo.name);

    const dailySummary =
      weather.daily.length > 0
        ? weather.daily.map((d) => ({ date: d.date, tempMax: d.tempMax, tempMin: d.tempMin, condition: getWeatherLabel(d.weatherCode) }))
        : undefined;

    yield {
      state: 'ready' as const,
      location: { name: geo.name, country: geo.country, timezone: geo.timezone },
      unit,
      current: {
        temperature: weather.current.temperature,
        feelsLike: weather.current.apparentTemperature,
        condition,
        weatherCode: weather.current.weatherCode,
        humidity: weather.current.humidity,
        windSpeed: weather.current.windSpeed,
        windDirection: weather.current.windDirection,
      },
      forecast: dailySummary,
    };
  },
});

export type WeatherUIToolInvocation = UIToolInvocation<typeof weatherTool>;
