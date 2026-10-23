export const shouldApplyHydratedTheme = (
  hydrationStartedAtRevision: number,
  currentThemeRevision: number,
): boolean => hydrationStartedAtRevision === currentThemeRevision;
