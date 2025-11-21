import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface TableStatus {
  name: string;
  exists: boolean;
  error?: string;
}

export const DatabaseChecker = () => {
  const [checking, setChecking] = useState(true);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    const tablesToCheck = [
      'profiles',
      'customer_data',
      'password_history',
      'orders',
      'order_items',
      'reviews'
    ];

    const results: TableStatus[] = [];

    for (const tableName of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1);

        results.push({
          name: tableName,
          exists: !error,
          error: error?.message
        });
      } catch (error: any) {
        results.push({
          name: tableName,
          exists: false,
          error: error?.message || 'Unknown error'
        });
      }
    }

    setTables(results);
    setChecking(false);
  };

  if (checking) {
    return null;
  }

  const missingTables = tables.filter(t => !t.exists);
  const allTablesExist = missingTables.length === 0;

  if (allTablesExist) {
    return null; 
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant="destructive" className="shadow-lg">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-bold">Database Not Set Up</AlertTitle>
        <AlertDescription className="space-y-2">
          <p className="text-sm">
            {missingTables.length} table(s) missing. Registration and profile features won't work.
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            <Button
              size="sm"
              onClick={() => window.open('https://supabase.com/dashboard/project/mokugiiuazqbdvxlbbun/sql/new', '_blank')}
              className="text-xs"
            >
              Open SQL Editor
            </Button>
          </div>

          {showDetails && (
            <div className="mt-3 space-y-1 text-xs bg-background/50 rounded p-2">
              {tables.map((table) => (
                <div key={table.name} className="flex items-center gap-2">
                  {table.exists ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className={table.exists ? 'text-green-600' : 'text-red-600'}>
                    {table.name}
                  </span>
                  {table.error && !table.exists && (
                    <span className="text-xs text-muted-foreground truncate">
                      ({table.error.substring(0, 30)}...)
                    </span>
                  )}
                </div>
              ))}
              <div className="mt-2 pt-2 border-t text-xs">
                <p className="font-medium mb-1">To fix:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Open SQL Editor</li>
                  <li>Copy content from MANUAL_MIGRATION.sql</li>
                  <li>Paste and click Run</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};
