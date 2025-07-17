import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HuffmanVisualizerProps {
  huffmanCodes: Map<number, string>;
  className?: string;
}

export function HuffmanVisualizer({ huffmanCodes, className }: HuffmanVisualizerProps) {
  const sortedCodes = Array.from(huffmanCodes.entries())
    .sort((a, b) => a[1].length - b[1].length || a[0] - b[0]);

  const getCharacterDisplay = (charCode: number) => {
    if (charCode >= 32 && charCode <= 126) {
      return String.fromCharCode(charCode);
    }
    return `\\x${charCode.toString(16).padStart(2, '0').toUpperCase()}`;
  };

  const getFrequencyColor = (codeLength: number) => {
    if (codeLength <= 3) return "bg-success";
    if (codeLength <= 6) return "bg-primary";
    if (codeLength <= 10) return "bg-accent";
    return "bg-muted";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Huffman Codes</span>
          <Badge variant="secondary">{huffmanCodes.size} unique characters</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {sortedCodes.map(([charCode, code]) => (
              <div
                key={charCode}
                className="flex items-center justify-between p-2 rounded-lg border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border bg-muted flex items-center justify-center font-mono text-sm">
                    {getCharacterDisplay(charCode)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Byte: {charCode}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`${getFrequencyColor(code.length)} text-white border-0`}
                  >
                    {code.length} bits
                  </Badge>
                  <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                    {code}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Average code length:</span>
              <div className="font-semibold">
                {(Array.from(huffmanCodes.values()).reduce((sum, code) => sum + code.length, 0) / huffmanCodes.size).toFixed(2)} bits
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Efficiency gain:</span>
              <div className="font-semibold text-success">
                {((8 - Array.from(huffmanCodes.values()).reduce((sum, code) => sum + code.length, 0) / huffmanCodes.size) / 8 * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}