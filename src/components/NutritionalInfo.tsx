import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Info, 
  Flame, 
  AlertCircle, 
  Leaf, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NutritionalInfoProps {
  calories?: number;
  allergens?: string[];
  ingredients?: string[];
  dietary_tags?: string[];
  nutritional_info?: {
    protein?: number;
    fat?: number;
    carbs?: number;
    sugar?: number;
    fiber?: number;
    sodium?: number;
  };
  serving_size?: string;
}

const NutritionalInfo = ({
  calories,
  allergens = [],
  ingredients = [],
  dietary_tags = [],
  nutritional_info,
  serving_size = "100g"
}: NutritionalInfoProps) => {
  const [expanded, setExpanded] = useState(false);

  const hasNutritionalData = calories || allergens.length > 0 || ingredients.length > 0 || dietary_tags.length > 0;

  if (!hasNutritionalData) {
    return null;
  }

  const allergenIcons: { [key: string]: string } = {
    'Dairy': '🥛',
    'Eggs': '🥚',
    'Nuts': '🥜',
    'Gluten': '🌾',
    'Soy': '🫘',
    'Wheat': '🌾',
    'Peanuts': '🥜',
    'Tree Nuts': '🌰',
    'Sesame': '🌻',
  };

  const dietaryIcons: { [key: string]: string } = {
    'Vegetarian': '🥗',
    'Vegan': '🌱',
    'Gluten-Free': '🚫🌾',
    'Dairy-Free': '🚫🥛',
    'Nut-Free': '🚫🥜',
    'Sugar-Free': '🚫🍬',
    'Keto': '🥑',
    'Low-Carb': '📉',
  };

  return (
    <div className="space-y-3">
      {/* Quick Info Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {calories && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Flame className="w-3 h-3" />
            {calories} cal
          </Badge>
        )}

        {dietary_tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="outline" 
            className="bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700"
          >
            <span className="mr-1">{dietaryIcons[tag] || '✓'}</span>
            {tag}
          </Badge>
        ))}

        {allergens.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Badge 
                variant="outline" 
                className="bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/50"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Contains Allergens
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Allergen Information
                </h4>
                <div className="space-y-1">
                  {allergens.map((allergen) => (
                    <div key={allergen} className="flex items-center gap-2 text-sm">
                      <span>{allergenIcons[allergen] || '⚠️'}</span>
                      <span>{allergen}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground border-t pt-2">
                  Please inform us of any allergies when ordering
                </p>
              </div>
            </PopoverContent>
          </Popover>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="ml-auto text-xs"
        >
          <Info className="w-3 h-3 mr-1" />
          {expanded ? 'Less' : 'More'} Info
          {expanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <Card className="p-4 bg-muted/50">
          <div className="space-y-4">
            {/* Nutritional Facts */}
            {nutritional_info && (
              <div>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Nutritional Facts
                  <span className="text-xs text-muted-foreground font-normal">
                    (per {serving_size})
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {calories && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Calories:</span>
                      <span className="font-medium">{calories} kcal</span>
                    </div>
                  )}
                  {nutritional_info.protein !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Protein:</span>
                      <span className="font-medium">{nutritional_info.protein}g</span>
                    </div>
                  )}
                  {nutritional_info.fat !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fat:</span>
                      <span className="font-medium">{nutritional_info.fat}g</span>
                    </div>
                  )}
                  {nutritional_info.carbs !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Carbs:</span>
                      <span className="font-medium">{nutritional_info.carbs}g</span>
                    </div>
                  )}
                  {nutritional_info.sugar !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sugar:</span>
                      <span className="font-medium">{nutritional_info.sugar}g</span>
                    </div>
                  )}
                  {nutritional_info.fiber !== undefined && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fiber:</span>
                      <span className="font-medium">{nutritional_info.fiber}g</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Ingredients
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {ingredients.join(', ')}
                </p>
              </div>
            )}

            {/* Allergen Details */}
            {allergens.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  Allergen Warning
                </h4>
                <div className="flex flex-wrap gap-2">
                  {allergens.map((allergen) => (
                    <Badge 
                      key={allergen}
                      variant="outline"
                      className="bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-xs"
                    >
                      <span className="mr-1">{allergenIcons[allergen] || '⚠️'}</span>
                      {allergen}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Made in a facility that also processes various allergens. 
                  Cross-contamination is possible.
                </p>
              </div>
            )}

            {/* Dietary Tags */}
            {dietary_tags.length > 0 && (
              <div className="pt-3 border-t">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Dietary Information
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dietary_tags.map((tag) => (
                    <Badge 
                      key={tag}
                      className="bg-green-600 text-white text-xs"
                    >
                      <span className="mr-1">{dietaryIcons[tag] || '✓'}</span>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default NutritionalInfo;
