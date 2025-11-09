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
  ]);

  const generateId = () => {
    // Don't try to generate if theme not selected or data not loaded
    if (!selectedTheme || !themes) {
      setGeneratedId('');
      return;
    }

    const theme = themes.find(t => t._id === selectedTheme);
    if (!theme) {
      setGeneratedId('');
      return;
    }

    // Get theme prefix from the database or default to first 3 letters
    const themePrefix = theme.prefix
      ? normalizeText(theme.prefix).toUpperCase()
      : normalizeText(theme.name.slice(0, 3)).toUpperCase();

    // Build parts of the ID
    let codePrefix = themePrefix;

    // Add subtheme prefix if selected
    if (selectedSubtheme && subthemes) {
      const subtheme = subthemes.find(s => s._id === selectedSubtheme);
      if (subtheme?.prefix) {
        const normalizedSubthemePrefix = normalizeText(
          subtheme.prefix,
        ).toUpperCase();
        codePrefix += `-${normalizedSubthemePrefix}`;
      }
    }

    // Add group prefix if selected
    if (selectedGroup && groups) {
      const group = groups.find(g => g._id === selectedGroup);
      if (group?.prefix) {
        const normalizedGroupPrefix = normalizeText(group.prefix).toUpperCase();
        codePrefix += `-${normalizedGroupPrefix}`;
      }
    }

 

    setGeneratedId(`${codePrefix}`);
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
