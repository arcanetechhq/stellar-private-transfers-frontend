export function getPeriodLabel(period: string) {
  switch (period) {
    case "last-7": {
      return "Last 7 days";
    }
    case "last-30": {
      return "Last 30 days";
    }
    case "last-90": {
      return "Last 90 days";
    }
    case "current-year": {
      return "Current year";
    }
    default: {
      return "Custom range";
    }
  }
}
