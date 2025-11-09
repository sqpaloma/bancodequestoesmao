'use client';

import { type FieldValues, type UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Id } from '../../../../../../../convex/_generated/dataModel';
import { QuestionFormData } from '../schema';

interface TaxonomyProps {
  form: UseFormReturn<QuestionFormData>;
  themes: Array<{ _id: Id<'themes'>; name: string }> | undefined;
  subthemes: Array<{ _id: Id<'subthemes'>; name: string }> | undefined;
  groups: Array<{ _id: Id<'groups'>; name: string }> | undefined;
  onThemeChange: (value: Id<'themes'>) => void;
  onSubthemeChange: (value: Id<'subthemes'> | undefined) => void;
  selectedTheme: Id<'themes'> | undefined;
  selectedSubtheme: Id<'subthemes'> | undefined;
}

export function Taxonomy({
  form,
  themes,
  subthemes,
  groups,
  onThemeChange,
  onSubthemeChange,
  selectedTheme,
  selectedSubtheme,
}: TaxonomyProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <FormField
        control={form.control}
        name="themeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Tema <span className="text-red-500">*</span>
            </FormLabel>
            <Select
              value={field.value as string}
              onValueChange={value => {
                field.onChange(value);
                onThemeChange(value as Id<'themes'>);
              }}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {themes?.map(theme => (
                  <SelectItem key={theme._id} value={theme._id}>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="subthemeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subtema (opcional)</FormLabel>
            <Select
              value={field.value ?? 'none'}
              onValueChange={value => {
                const newValue = value === 'none' ? undefined : value;
                field.onChange(newValue);
                onSubthemeChange(newValue as Id<'subthemes'> | undefined);
              }}
              disabled={!selectedTheme}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o subtema" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {subthemes?.map(subtheme => (
                  <SelectItem key={subtheme._id} value={subtheme._id}>
                    {subtheme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="groupId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Grupo (opcional)</FormLabel>
            <Select
              value={field.value ?? 'none'}
              onValueChange={value => {
                field.onChange(value === 'none' ? undefined : value);
              }}
              disabled={!selectedSubtheme}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o grupo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {groups?.map(group => (
                  <SelectItem key={group._id} value={group._id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
