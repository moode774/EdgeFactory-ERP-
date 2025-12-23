// Smart Auto-Complete Service for Manufacturing Work Orders
// Provides intelligent suggestions based on historical data patterns

export interface SuggestionData {
    customers: string[];
    paintCodes: string[];
    commonPhrases: string[];
    itemNames: string[];
    modelCodes: string[];
    woodMaterials: string[];
    hardwareMaterials: string[];
    veneerOptions: string[];
    units: string[];
}

class AutoCompleteService {
    private data: SuggestionData = {
        // Top customers by frequency
        customers: [
            'ALABDULLATIF FURNITURE',
            'SAMPLE FACTORY',
            'Mr.Soliman Al Gabreen',
            'SKH/ ABDULATIF',
            'FACTORY (ALAJLAN)',
            'Mr. ABDULHAMEED ALGHALIGA',
            'MADINA BRANCH',
            'ALYASMEEN BRANCH',
            'OLAYA BRANCH',
        ],

        // Common paint codes
        paintCodes: [
            'P04219',
            'P04245',
            'P04297',
            'P04257',
            'P04222',
            'P04217',
            'P04051',
            'P03708',
            'P03709',
            'P03720',
            'P03739',
            'P03740',
            'P04004',
            'P03101',
            'P01447',
        ],

        // Most frequent phrases for Design/Notes fields
        commonPhrases: [
            'AS PER SAMPLE',
            'AS PER STOCK',
            'AS PER SHOP DRAWING',
            'AS PER DRAWING',
            'SAME SAMPLE',
            'SAME COLOR APPROVED',
            'AS PER SAMPLE APPROVED',
            'MATCHING WITH SAMPLE',
            'color as per sample',
            'AS PER SAMPLE MAIL',
        ],

        // Common item names
        itemNames: [
            'DINING TABLE',
            'DINING CHAIR W/O ARM',
            'DINING CHAIR WITH ARM',
            'DINING BUFFET',
            'BUFFET MIRROR',
            'DINING BUFFET MIRROR',
            'CREDENZA',
            'CREDENZA WITH GLASS TOP',
            'DESK',
            'DESK WITH GLASS',
            'SIDE EXTENSION',
            'SIDE TABLE',
            'MIDDLE TABLE',
            'CENTER TABLE',
            'ROUND TABLE',
            'ROUND MIDDLE TABLE',
            'COAT HANGER',
            'SOFA',
            'DOORS',
        ],

        // Common model codes
        modelCodes: [
            '4030',
            '4070',
            '3530',
            'ROYAL',
            'CT25',
            'CT18',
            'CT8',
            'D-4070',
            'CH-4070',
            'B-4070',
            'F0806',
            'F0813',
        ],

        // Wood materials
        woodMaterials: [
            'MDF 17MM - 715',
            'MDF 18 ORD',
            'MDF 12 ORD',
            'CHIPBOARD MELAMINE WHITE',
            'BEECH SOLID WOOD',
            'OAK WOOD',
            'PINE WOOD',
            'HOLLOW CORE',
            'VENEER',
        ],

        // Hardware/Accessories materials
        hardwareMaterials: [
            'TEMPERED CLEAR GLASS 8MM',
            'GLASS TOP TEMPERED 8MM',
            'HPL',
            'PAINT MATERIAL',
            'TOP COAT PAINTED',
            'MIRROR',
        ],

        // Veneer options
        veneerOptions: [
            'NO',
            'YES',
            'V30',
            'V31',
            'V131',
            'OLIVE BURL',
        ],

        // Common units (English only)
        units: [
            'Sheets',
            'Boards',
            'Pieces',
            'Meters',
            'Sq.M',
            'Linear M',
            'Sets',
            'Pcs',
            'M2',
            'LM',
        ],
    };

    // Get suggestions for a specific field type
    getSuggestions(
        type: keyof SuggestionData,
        filter?: string
    ): string[] {
        const suggestions = this.data[type] || [];

        if (!filter || filter.trim() === '') {
            return suggestions.slice(0, 10); // Return top 10
        }

        // Filter suggestions based on input
        const filterLower = filter.toLowerCase();
        return suggestions
            .filter(item => item.toLowerCase().includes(filterLower))
            .slice(0, 10);
    }

    // Get suggestions based on category (for materials)
    getMaterialSuggestions(category: 'wood' | 'accessories' | 'other', filter?: string): string[] {
        if (category === 'wood') {
            return this.getSuggestions('woodMaterials', filter);
        } else if (category === 'accessories') {
            return this.getSuggestions('hardwareMaterials', filter);
        }
        return [];
    }

    // Add a new value to suggestions (learning feature)
    addToSuggestions(type: keyof SuggestionData, value: string) {
        if (!value || value.trim() === '') return;

        const suggestions = this.data[type];
        if (!suggestions.includes(value)) {
            suggestions.push(value);
        }
    }

    // Get all data for a specific type
    getAllSuggestions(type: keyof SuggestionData): string[] {
        return this.data[type] || [];
    }
}

export const autoCompleteService = new AutoCompleteService();
