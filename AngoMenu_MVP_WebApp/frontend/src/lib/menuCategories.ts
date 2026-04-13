export const MENU_CATEGORIES = [
    'Starter',
    'MainCourse',
    'Grill',
    'Seafood',
    'Pasta',
    'Pizza',
    'Burger',
    'Sandwich',
    'Salad',
    'Soup',
    'SideDish',
    'Dessert',
    'IceCream',
    'Bakery',
    'Breakfast',
    'KidsMenu',
    'Vegetarian',
    'Vegan',
    'Drinks',
    'SoftDrink',
    'Juice',
    'Smoothie',
    'Coffee',
    'Tea',
    'Beer',
    'Wine',
    'Spirits',
    'Cocktail',
    'Combo',
    'HouseSpecial',
    'Other',
] as const;

export type MenuCategory = typeof MENU_CATEGORIES[number];

export const MENU_CATEGORY_LABELS_PT: Record<MenuCategory, string> = {
    Starter: 'Entradas',
    MainCourse: 'Pratos Principais',
    Grill: 'Grelhados',
    Seafood: 'Mariscos',
    Pasta: 'Massas',
    Pizza: 'Pizzas',
    Burger: 'Hambúrgueres',
    Sandwich: 'Sanduíches',
    Salad: 'Saladas',
    Soup: 'Sopas',
    SideDish: 'Acompanhamentos',
    Dessert: 'Sobremesas',
    IceCream: 'Gelados',
    Bakery: 'Padaria',
    Breakfast: 'Pequeno-Almoço',
    KidsMenu: 'Menu Infantil',
    Vegetarian: 'Vegetariano',
    Vegan: 'Vegan',
    Drinks: 'Bebidas',
    SoftDrink: 'Refrigerantes',
    Juice: 'Sucos',
    Smoothie: 'Batidos',
    Coffee: 'Café',
    Tea: 'Chá',
    Beer: 'Cervejas',
    Wine: 'Vinhos',
    Spirits: 'Bebidas Espirituosas',
    Cocktail: 'Cocktails',
    Combo: 'Combos',
    HouseSpecial: 'Especialidades da Casa',
    Other: 'Outros',
};

export function getMenuCategoryLabel(category: MenuCategory | string | null | undefined): string {
    if (!category || !(category in MENU_CATEGORY_LABELS_PT)) {
        return MENU_CATEGORY_LABELS_PT.Other;
    }

    return MENU_CATEGORY_LABELS_PT[category as MenuCategory];
}