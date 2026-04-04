const LOCALE_TAG = "en-US";
const UNIX_EPOCH_MILLISECONDS_SHIFT = 1000;

const DETAIL_VIEW_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export function formatDetailViewDateTimeFromIso(isoDate: string): string {
  return new Date(isoDate).toLocaleString(LOCALE_TAG, DETAIL_VIEW_DATE_OPTIONS);
}

export function formatDetailViewDateTimeFromUnixSeconds(
  unixSeconds: number,
): string {
  const milliseconds = unixSeconds * UNIX_EPOCH_MILLISECONDS_SHIFT;
  return new Date(milliseconds).toLocaleString(LOCALE_TAG, DETAIL_VIEW_DATE_OPTIONS);
}
