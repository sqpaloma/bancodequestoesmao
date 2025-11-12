import { useQuery } from 'convex/react';
import { useCallback, useEffect, useState } from 'react';

import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { normalizeText } from '../../../../../../convex/utils';

export function useTaxonomyData(
  defaultThemeId?: Id<'themes'>,
  defaultSubthemeId?: Id<'subthemes'>,
  defaultGroupId?: Id<'groups'>,
) {
  const [selectedTheme, setSelectedTheme] = useState<Id<'themes'> | undefined>(
    defaultThemeId,
  );
  const [selectedSubtheme, setSelectedSubtheme] = useState<
    Id<'subthemes'> | undefined
  >(defaultSubthemeId);
  const [selectedGroup, setSelectedGroup] = useState<Id<'groups'> | undefined>(
    defaultGroupId,
  );
  const [generatedId, setGeneratedId] = useState<string>('');
  const [codePrefix, setCodePrefix] = useState<string>('');

  // Query data
  const themes = useQuery(api.themes.list);
  const subthemes = useQuery(
    api.subthemes.list,
    selectedTheme ? { themeId: selectedTheme } : 'skip',
  );
  const groups = useQuery(
    api.groups.list,
    selectedSubtheme ? { subthemeId: selectedSubtheme } : 'skip',
  );

  // Query next sequential number based on the code prefix
  const nextSequentialNumber = useQuery(
    api.questions.getNextSequentialNumber,
    codePrefix ? { codePrefix } : 'skip',
  );

  // Generate ID whenever dependencies change
  useEffect(() => {
    generateId();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedTheme,
    selectedSubtheme,
    selectedGroup,
    themes,
    subthemes,
    groups,
    nextSequentialNumber,
  ]);

  const generateId = () => {
    // Don't try to generate if theme not selected or data not loaded
    if (!selectedTheme || !themes) {
      setGeneratedId('');
      setCodePrefix('');
      return;
    }

    const theme = themes.find(t => t._id === selectedTheme);
    if (!theme) {
      setGeneratedId('');
      setCodePrefix('');
      return;
    }

    // Get theme prefix from the database or default to first 3 letters
    const themePrefix = theme.prefix
      ? normalizeText(theme.prefix).toUpperCase()
      : normalizeText(theme.name.slice(0, 3)).toUpperCase();

    // Build parts of the ID
    let prefix = themePrefix;

    // Add subtheme prefix if selected
    if (selectedSubtheme && subthemes) {
      const subtheme = subthemes.find(s => s._id === selectedSubtheme);
      if (subtheme?.prefix) {
        const normalizedSubthemePrefix = normalizeText(
          subtheme.prefix,
        ).toUpperCase();
        prefix += normalizedSubthemePrefix;
      }
    }

    // Add group prefix if selected
    if (selectedGroup && groups) {
      const group = groups.find(g => g._id === selectedGroup);
      if (group?.prefix) {
        const normalizedGroupPrefix = normalizeText(group.prefix).toUpperCase();
        prefix += normalizedGroupPrefix;
      }
    }

    // Store the prefix to trigger the sequential number query
    setCodePrefix(prefix);

    // Add sequential number if available
    if (nextSequentialNumber !== undefined) {
      // Format the number with leading zeros (e.g., 001, 002, etc.)
      const formattedNumber = nextSequentialNumber.toString().padStart(3, '0');
      setGeneratedId(`${prefix} ${formattedNumber}`);
    } else {
      // Show prefix while loading the sequential number
      setGeneratedId(`${prefix} ...`);
    }
  };

  // Reset dependent fields when parent selection changes
  const handleThemeChange = (themeId: Id<'themes'> | undefined) => {
    setSelectedTheme(themeId);
    setSelectedSubtheme(undefined);
    setSelectedGroup(undefined);
  };

  const handleSubthemeChange = (subthemeId: Id<'subthemes'> | undefined) => {
    setSelectedSubtheme(subthemeId);
    setSelectedGroup(undefined);
  };

  return {
    // Data
    themes,
    subthemes,
    groups,

    // Selected values
    selectedTheme,
    selectedSubtheme,
    selectedGroup,

    // Setters with cascading reset
    setSelectedTheme: handleThemeChange,
    setSelectedSubtheme: handleSubthemeChange,
    setSelectedGroup,

    // Generated ID
    generatedId,
  };
}
