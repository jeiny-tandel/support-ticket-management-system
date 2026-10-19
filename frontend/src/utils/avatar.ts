// Returns the uppercase first letter of a user's name, or a fallback if unavailable
export const getAvatarInitial = (
  name?: string | null,
  fallback: string = '?',
): string => {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0
    ? trimmed.charAt(0).toUpperCase()
    : fallback;
};

export default getAvatarInitial;
