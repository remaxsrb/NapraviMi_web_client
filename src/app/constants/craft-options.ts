export interface CraftOption {
  label: string;
  value: string;
  keywords: string[];
}

export const CRAFT_OPTIONS: CraftOption[] = [
  { label: 'Kovač', value: 'blacksmith', keywords: ['kovač', 'kovac', 'blacksmith'] },
  { label: 'Duborezac', value: 'woodcarver', keywords: ['duborezac', 'woodcarver'] },
  { label: 'Obućar', value: 'shoemaker', keywords: ['obucar', 'obućar', 'shoemaker'] },
  { label: 'Grnčar', value: 'potter', keywords: ['grncar', 'grnčar', 'potter'] },
  { label: 'Bačvar', value: 'cooper', keywords: ['bacvar', 'bačvar', 'cooper'] },
];

export function craftLabel(value: string): string {
  return CRAFT_OPTIONS.find((c) => c.value === value)?.label ?? value;
}
